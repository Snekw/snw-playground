const fs = require('fs')

const ORDER_PATH = 'order.json'

/**
 * Order information
 * @typedef {Object} Order
 * @property {Array} order
 */

/**
 * Get order from file
 */
function getCurrentOrderString() {
    try {
        return fs.readFileSync(ORDER_PATH).toString()
    } catch (e) {
        if (e.code === 'ENOENT') {
            return undefined
        }
        throw e
    }
}

/**
 * Parse order string to order object
 * @param {string} orderString 
 * @returns {Order}
 */
function parseOrder(orderString) {
    if (!orderString) {
        return { order: [] }
    }
    const data = JSON.parse(orderString)
    if (!data || !data.order || !Array.isArray(data.order)) {
        return { order: [] }
    }
    return data
}

/**
 * Finds all apps in the 'apps' directory
 * @returns {string[] | undefined}
 */
function findApps() {
    try {
        return fs.readdirSync('src/apps')
    } catch (e) {
        console.error(e)
    }
    return undefined
}

/**
 * Write order to file
 * @param {Order} orderData 
 */
function writeNewOrder(orderData) {
    if (!orderData) {
        return
    }
    fs.writeFileSync(ORDER_PATH, JSON.stringify(orderData, null, 2))
}

function updateOrder() {
    const oldOrder = getCurrentOrderString()

    const order = parseOrder(oldOrder)

    const apps = findApps()
    if (!apps) {
        console.log('No apps found. Exiting.')
        return
    }

    const newApps = apps
        .filter(a => order.order.findIndex(o => o === a) < 0)
        .sort((a, b) => a.localeCompare(b))


    order.order = order.order
        .concat(newApps)
        .filter(a => apps.findIndex(v => a === v) > -1)

    writeNewOrder(order)
}

function getCurrentOrder() {
    const curOrder = getCurrentOrderString()

    return parseOrder(curOrder)
}

module.exports = {
    updateOrder,
    getCurrentOrder
}