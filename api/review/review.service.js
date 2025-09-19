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

        var review
    } catch (err) {
        
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.byUserId) {
        criteria.byUserId = ObjectId.createFromHexString(filterBy.byUserId)
    }

    return criteria
}