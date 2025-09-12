import { toyService } from './toy.service.js'
import { loggerService } from '../../services/logger.service.js'

export async function getToys(req, res) {
    try {
        const { txt, inStock, labels, pageIdx, sortBy } = req.query
        const filterBy = {
            txt: txt || '',
            inStock: inStock || null,
            labels: labels || [],
            pageIdx: +pageIdx || 0,
            sortBy: sortBy || { type: '', sortDir: 1 },
        }
        const toys = await toyService.query(filterBy)
        res.send(toys)
    } catch (err) {
        loggerService.error('Cannot load toys', err)
        res.status(500).send('Cannot load toys')
    }
}

export async function getToyById(req, res) {
    try {
        const { toyId } = req.params
        const toy = await toyService.getById(toyId)
        res.send(toy)
    } catch (err) {
        loggerService.error('Cannot get toy', err)
        res.status(500).send('Cannot get toy')
    }
}

export async function addToy(req, res) {
    const { name, price, labels = [], inStock = true, msgs = [] } = req.body
    if (!name || !price) res.status(400).send('Missing data')

    const toy = { name, price, labels, inStock, msgs }
    try {
        const newToy = await toyService.add(toy)
        res.send(newToy)
    } catch (err) {
        loggerService.error('Cannot add toy', err)
        res.status(500).send('Cannot add toy')
    }
}

export async function updateToy(req, res) {
    const { _id, name, price, labels = [], inStock = true, msgs = [] } = req.body
    if (!name || !price || !_id) res.status(400).send('Missing data')

    const toy = { _id, name, price, labels, inStock, msgs }
    try {
        const updatedToy = await toyService.update(toy)
        res.send(updatedToy)
    } catch (err) {
        loggerService.error('Cannot update toy', err)
        res.status(500).send('Cannot update toy')
    }
}

export async function removeToy(req, res) {
    try {
        const { toyId } = req.params
        await toyService.remove(toyId)
        res.send()
    } catch (err) {
        loggerService.error('Cannot delete toy', err)
        res.status(500).send('Cannot delete toy, ' + err)
    }
}

export async function addToyMsg(req, res) {
    const { loggedinUser } = req
    try {
        const { toyId } = req.params
        const { txt } = req.body
        const { _id, fullname } = loggedinUser
        const msg = {
            txt,
            by: { _id, fullname },
        }
        const addedMsg = await toyService.addMsg(toyId, msg)
        res.send(addedMsg)
    } catch (err) {
        loggerService.error('Cannot add message to toy', err)
        res.status(500).send('Cannot add message to toy')
    }
}

export async function removeToyMsg(req, res) {
    try {
        const { toyId, msgId } = req.params
        await toyService.removeMsg(toyId, msgId)
        res.send(msgId)
    } catch (err) {
        loggerService.error('Cannot delete message from toy', err)
        res.status(500).send('Cannot delete message from toy')
    }
}