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
    connectAndSetup,
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

const demoToysData = [
    {
        "name": "Remote Control Car",
        "imgUrl": "https://images.pexels.com/photos/29082154/pexels-photo-29082154.jpeg",
        "price": 45,
        "labels": ["On wheels", "Battery Powered"],
        "createdAt": 1631031801011,
        "inStock": true
    },
    {
        "name": "Chess Set",
        "imgUrl": "https://images.pexels.com/photos/6598772/pexels-photo-6598772.jpeg",
        "price": 25,
        "labels": ["Box game", "Art"],
        "createdAt": 1642145678900,
        "inStock": true
    },
    {
        "name": "Baby Mobile",
        "imgUrl": "https://images.pexels.com/photos/11369154/pexels-photo-11369154.jpeg",
        "price": 30,
        "labels": ["Baby", "Art"],
        "createdAt": 1653259876543,
        "inStock": true
    },
    {
        "name": "Building Blocks",
        "imgUrl": "https://images.pexels.com/photos/1148496/pexels-photo-1148496.jpeg",
        "price": 20,
        "labels": ["Puzzle", "Outdoor"],
        "createdAt": 1664374567890,
        "inStock": false
    },
    {
        "name": "Toy Robot",
        "imgUrl": "https://images.pexels.com/photos/8294651/pexels-photo-8294651.jpeg",
        "price": 75,
        "labels": ["Battery Powered", "On wheels"],
        "createdAt": 1675489876543,
        "inStock": true
    },
    {
        "name": "Wooden Dollhouse",
        "imgUrl": "https://images.pexels.com/photos/191360/pexels-photo-191360.jpeg",
        "price": 90,
        "labels": ["Doll", "Art"],
        "createdAt": 1686604567890,
        "inStock": false
    },
    {
        "name": "Jigsaw Puzzle",
        "imgUrl": "https://images.pexels.com/photos/3482442/pexels-photo-3482442.jpeg",
        "price": 15,
        "labels": ["Puzzle", "Box game"],
        "createdAt": 1697718901234,
        "inStock": true
    },
    {
        "name": "Tricycle",
        "imgUrl": "https://images.pexels.com/photos/1230751/pexels-photo-1230751.jpeg",
        "price": 55,
        "labels": ["Outdoor", "On wheels", "Baby"],
        "createdAt": 1708834567890,
        "inStock": true
    },
    {
        "name": "Action Figure",
        "imgUrl": "https://images.pexels.com/photos/7829101/pexels-photo-7829101.jpeg",
        "price": 28,
        "labels": ["Doll", "Art"],
        "createdAt": 1719949876543,
        "inStock": false
    },
    {
        "name": "Electronic Drum Set",
        "imgUrl": "https://images.pexels.com/photos/258668/pexels-photo-258668.jpeg",
        "price": 110,
        "labels": ["Battery Powered", "Art"],
        "createdAt": 1731064567890,
        "inStock": true
    }
]

async function _setupInitialToys() {
    try {
        const collection = await dbService.getCollection('toy')
        const count = await collection.countDocuments()

        if (count === 0) {
            await collection.insertMany(demoToysData)
            loggerService.info('Initial toys successfully added to the database.')
        } else {
            loggerService.info('Toy collection is already populated.')
        }
    } catch (err) {
        loggerService.error('Failed to set up initial toys:', err)
        throw err
    }
}

async function connectAndSetup() {
    await _setupInitialToys()
}