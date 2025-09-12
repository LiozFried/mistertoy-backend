import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'

import { loggerService } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

const PAGE_SIZE = 5

export const toyService = {
    query,
    getById,
    remove,
    add,
    update,
    addMsg,
    removeMsg,
}

async function query(filterBy = {}) {
    try {
        const { filterCriteria, sortCriteria, skip } = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('toy')

        const prmTotalCount = collection.countDocuments(filterCriteria)
        const prmFilteredToys = collection.find(filterCriteria, { sort: sortCriteria, skip, limit: PAGE_SIZE }).toArray()

        const [totalCount, filteredToys] = await Promise.all([prmTotalCount, prmFilteredToys])
        const maxPage = Math.ceil(totalCount / PAGE_SIZE)
        return { toys: filteredToys, maxPage }
    } catch (err) {
        loggerService.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
        return toy
    } catch (err) {
        loggerService.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
    } catch (err) {
        loggerService.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        toy.createdAt = Date.now()
        toy.inStock = true

        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        loggerService.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        const { name, price, labels } = toy
        const toyToUpdate = {
            name,
            price,
            labels,
        }

        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: toyToUpdate })
        return toy
    } catch (err) {
        loggerService.error(`cannot update toy ${toy._id}`, err)
        throw err
    }
}

async function addMsg(toyId, msg) {
    msg.id = utilService.makeId()

    try {
        const collection = await dbService.getCollection('toy')

        await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        loggerService.error(`cannot add message to toy ${toyId}`, err)
        throw err
    }
}

async function removeMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $pull: { msgs: { id: msgId } } }
        )
        return msgId
    } catch (err) {
        loggerService.error(`cannot remove message from toy ${toyId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const filterCriteria = {}

    if (filterBy.txt) {
        filterCriteria.name = { $regex: filterBy.txt, $options: 'i' }
    }

    if (filterBy.inStock) {
        filterCriteria.inStock = JSON.parse(filterBy.inStock)
    }

    if (filterBy.labels && filterBy.labels.length) {
        filterCriteria.labels = { $all: filterBy.labels }
    }


    const sortCriteria = {}

    const sortBy = filterBy.sortBy
    if (sortBy.type) {
        const sortDirection = +sortBy.sortDir
        sortCriteria[sortBy.type] = sortDirection
    } else {
        sortCriteria.createdAt = -1
    }

    const skip = filterBy.pageIdx !== undefined ? filterBy.pageIdx * PAGE_SIZE : 0

    return { filterCriteria, sortCriteria, skip }
}