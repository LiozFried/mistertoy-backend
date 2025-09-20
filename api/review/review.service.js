import { Collection, ObjectId } from 'mongodb'

import { asyncLocalStorage } from '../../services/als.service.js'
import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'

export const reviewService = {
    query,
    remove,
    add,
}

async function query(filterBy = {}) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()

        filterBy.byUserId = loggedinUser._id
        const criteria = _buildCriteria(filterBy)

        const collection = await dbService.getCollection('review')

        var review = await collection.aggregate([
            { $match: criteria },
            {
                $lookup: {
                    from: 'user',
                    foreignField: '_id',
                    localField: 'byUserId',
                    as: 'byUser',
                    pipeline: [
                        { $set: { 'userId': '$_id' } },
                        { $unset: ['_id', 'password'] }
                    ]
                }
            },
            { $set: { byUser: { $arrayElemAt: ["byUser", 0] } } },
            {
                $lookup: {
                    from: 'toy',
                    foreignField: '_id',
                    localField: 'aboutToyId',
                    as: 'aboutToy',
                    pipeline: [
                        { $set: { toyId: '$_id' } },
                        { $unset: ['_id'] }
                    ]
                }
            },
            { $unwind: '$aboutToy' },
            {
                $project: {
                    byUserId: 0,
                    aboutToyId: 0,
                    'aboutToy.labels': 0,
                    'aboutToy.createdAt': 0,
                    msgs: 0
                }
            }
        ]).toArray()

        return review
    } catch (err) {
        loggerService.error('Cannot get reviews', err)
        throw err
    }
}

async function remove(reviewId) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const collection = await dbService.getCollection('review')

        const criteria = { _id: ObjectId.createFromHexString(reviewId) }
        if (!loggedinUser.isAdmin) {
            criteria.byUserId = ObjectId.createFromHexString(loggedinUser._id)
        }

        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        loggerService.error(`Cannot remove review ${reviewId}`, err)
        throw err
    }
}

async function add(review) {
    try {
        const reviewToAdd = {
            byUserId: ObjectId.createFromHexString(review.byUserId),
            aboutToyId: ObjectId.createFromHexString(review.aboutToyId),
            txt: review.txt,
        }

        const collection = await dbService.getCollection('review')
        await collection.insertOne(reviewToAdd)

        return reviewToAdd
    } catch (err) {
        loggerService.error('Cannot add review', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.byUserId) {
        criteria.byUserId = ObjectId.createFromHexString(filterBy.byUserId)
    }

    return criteria
}