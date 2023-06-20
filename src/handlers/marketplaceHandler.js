const Marketplace = require('../models/marketplace')

const listMarketplaces = () => Marketplace.find().then(marketplaces => marketplaces.map(marketplace => marketplace.name))

module.exports = {
  listMarketplaces
}