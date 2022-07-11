/**
 * Test data for the distribution
 */
const Artist = require('../../model/agent')
const Contact = require('../../model/contact');
const Art = require('../../model/art');
const Carrier = require('../../model/carrier');
const Distribution = require('../../model/distribution');
const Moment = require('moment');

let AddressIds = [
  {addrId: 9999001, name: 'artist-1'},
  {addrId: 9999002, name: 'contract-1'},
  {addrId: 9999003, name: 'location-1'},
  {addrId: 9999004, name: 'artist-2'},

  // selecting
  {addrId: 9997001, name: 'artist-1'},
  {addrId: 9997002, name: 'contract-1'},
  {addrId: 9997003, name: 'location-1'},
  {addrId: 9997004, name: 'artist-2'}
];
let ArtistIds = [
  {artistId: 999001, type: 'artist', contacts: [{addr: 9999001, percentage: 100}]},
  {artistId: 999002, type: 'collective', contacts: [{addr: 9999001, percentage: 60}, {addr: 9999003, percentage: 40}]},
  {artistId: 999003, type: 'artist', percentage: 65, contacts: [{addr: 9999003, percentage: 100}]},
  {artistId: 999004, type: 'artist', percentage: 65, contacts: [{addr: 9999004, percentage: 100}]},

  {artistId: 997001, type: 'artist',       contacts: [{addr: 9997001, percentage: 100}]},
  {artistId: 997002, type: 'collective',  contacts: [{addr: 9997001, percentage: 60}, {addr: 9999003, percentage: 40}]},
  {artistId: 997003, type: 'artist', percentage: 65,      contacts: [{addr: 9997003, percentage: 100}]},
  {artistId: 997004, type: 'artist', percentage: 65,      contacts: [{addr: 9997004, percentage: 100}]},
];
let ArtIds = [
  {artId: 9998001, royaltiesPercentage: 100,  agents:[{artist: 999001, percentage: 65}] },
  {artId: 9998002, royaltiesPercentage: 0,    agents:[{artist: 999002}] },
  {artId: 9998003, royaltiesPercentage: 0,    agents:[{artist: 999003}] },
  {artId: 9998004, royaltiesPercentage: 0,    agents:[{artist: 999003}] },

  // selecting
  {artId: 9997001, royaltiesPercentage: 100,  agents:[{artist: 997001}] },
  {artId: 9997002, royaltiesPercentage: 0,    agents:[{artist: 997002}] },
  {artId: 9997003, royaltiesPercentage: 0,    agents:[{artist: 997003}] },
  {artId: 9997004, royaltiesPercentage: 0,    agents:[{artist: 997003, percentage: 100}] },

  // error - royalties
  {artId: 9996001, agents:[{artist: 997001, percentage: 120}] },
];
let CarrierIds = [
  {carrierId: 99997001, art: [{art: 9998001}]}
]

let DistributionIds = [
  // checks for data integrety
  {distributionId: 99996001, addrInvoice: 9999002, rentalDate: -1, lines: [
      {order: 'a-0', price: 1000, art: 9998001 }]
  },
  {distributionId: 99996002, addrInvoice: 9999002, rentalDate: -1, lines: [
      {order: 'a-0', price: 1000, carrierIndex:0 }]
  },
  {distributionId: 99996003, addrInvoice: 9999002, rentalDate: -1, lines: [
      {order: 'a-0', price: 200, art: 9998003 }]
  },
  {distributionId: 99996004, addrInvoice: 9999002, rentalDate: -1, lines: [
      {order: 'a-0', price: 1000, art: 9998002 },
      {order: 'a-0', price: 1000, art: 9998003 }]
  },
  {distributionId: 99996005, addrInvoice: 9999002, rentalDate: -1, lines: [
      {order: 'a-0', price: 200, art: 9998002 }]
  },
  {distributionId: 99996006, addrInvoice: 9999002, rentalDate: -10, lines: [
      {order: 'a-0', price: 200, art: 9998003 },
      {order: 'a-1', price: 400, art: 9998004 }
    ],
  },
  // error royalties
  {distributionId: 99995001, addrInvoice: 9999002, rentalDate: -1, lines: [
      {order: 'a-0', price: 1000, art: 9996001 }]
  },


  // selecting
  {distributionId: 99986003, addrInvoice: 9999002, rentalDate: -20, lines: [
      {order: 'a-0', price: 200, art: 9998003 }]
  },
  {distributionId: 99986004, addrInvoice: 9999002, rentalDate: -20, lines: [
      {order: 'a-0', price: 1000, art: 9998002 },
      {order: 'a-0', price: 1000, art: 9998003 }]
  },
  {distributionId: 99986005, addrInvoice: 9999002, rentalDate: -20, lines: [
      {order: 'a-0', price: 200, art: 9998002 }]
  },
  {distributionId: 99986006, addrInvoice: 9999002, rentalDate: -20, lines: [
      {order: 'a-0', price: 200, art: 9998003 },
      {order: 'a-1', price: 400, art: 9998004 }
    ],
  },
]

const DIST_DATA_INDEX = {
  'royalties-artist': DistributionIds.find( x => x.distributionId === 99996003),
  'royalties-collective': DistributionIds.find( x => x.distributionId === 99996005),
  'royalties-multiline': DistributionIds.find( x => x.distributionId === 99996006),
  'royalties-error-agent-max': DistributionIds.find( x => x.distributionId === 99995001),
}

const addDistribution = async function(session) {
  if (!session) {
    return 'missing session';
  }
  for (let index = 0; index < AddressIds.length; index++) {
    let contact = await Contact.create(session, {
      contactId: AddressIds[index].addrId,
      name: AddressIds[index].name
    });
    await contact.save()
    AddressIds[index].id = contact._id
  }

  for (let index = 0; index < ArtistIds.length; index++) {
    let artist = await Artist.create(session, {agentId: ArtistIds[index].artistId, name: `artist.${ArtistIds[index].artistId}`, type: ArtistIds[index].type, percentage: ArtistIds[index].percentage});
    for (let cntIndex = 0; cntIndex < ArtistIds[index].contacts.length; cntIndex++) {
      // let addrIndex = ArtistIds[index].contacts[cntIndex].index;
      let addr = AddressIds.find(addr => addr.addrId === ArtistIds[index].contacts[cntIndex].addr)
      artist.contacts.push({contact: addr.id, percentage: ArtistIds[index].contacts[cntIndex].percentage, isArtist: true })
    }
    await artist.save();
    ArtistIds[index].id = artist._id
  }

  // --- the artworks
  for (let index = 0; index < ArtIds.length; index++) {
    let art = await Art.create(session, { artId: ArtIds[index].artId, title: `art.${ArtIds[index].artId}`, type: 'video', royaltiesPercentage: ArtIds[index].royaltiesPercentage})
    for (let agIndex = 0; agIndex < ArtIds[index].agents.length; agIndex++) {
      // let cIndex = ArtIds[index].agents[agIndex].index;
      let artist = ArtistIds.find(ar => ar.artistId === ArtIds[index].agents[agIndex].artist)
      // art.agentAdd({agent: artist.id});
      art.agents.push({agent: artist.id, percentage:  ArtIds[index].agents[agIndex].percentage})
    }
    await art.save();
    ArtIds[index].id = art.id;
  }

  // the carriers
  for (let index = 0; index < CarrierIds.length; index++) {
    let carrier = await Carrier.create(session, { carrierId: CarrierIds[index].carrierId, type: 'file'})
    for (let aIndex = 0; aIndex < CarrierIds[index].art.length; aIndex++) {
      // let i = CarrierIds[index].art[aIndex].index;
      let art = ArtIds.find(a => a.artId === CarrierIds[index].art[aIndex].art)
      carrier.artwork.push({art: art.id});
    }
    await carrier.save();
    CarrierIds[index].id = carrier._id;
  }

  // --- the distribution
  for (let index = 0; index < DistributionIds.length; index++) {
    let invAddr = AddressIds.find( x => x.addrId === DistributionIds[index].addrInvoice);
    let distr = await Distribution.create(session, {locationId: DistributionIds[index].distributionId, event: `event.${DistributionIds[index].distributionId}`, invoice: invAddr.id, eventStartDate: Moment().add(DistributionIds[index].rentalDate, 'days' )});
    for (let lineIndex = 0; lineIndex < DistributionIds[index].lines.length; lineIndex++) {
      let line = DistributionIds[index].lines[lineIndex]
      if (line.artIndex !== undefined) {
        distr.lines.push({order: line.order, art: ArtIds[line.artIndex].id, price: line.price})
      } else if ( line.art !== undefined) {
        let i = ArtIds.findIndex( x => x.artId === line.art)
        distr.lines.push({order: line.order, art: ArtIds[i].id, price: line.price})
      } else {
        distr.lines.push({order: line.order, carrier: CarrierIds[line.carrierIndex].id, price: line.price})
      }
    }
    await distr.save();
    DistributionIds[index].id = distr.id;
  }

  return true;
}

const removeDistribution = async function(session) {
  for (let index = 0; index < ArtistIds.length; index++) {
    await Artist.deleteMany({agentId: ArtistIds[index].artistId})
  }
  for (let index = 0; index < AddressIds.length; index++) {
    await Contact.deleteMany({contactId: AddressIds[index].addrId})
  }
  for (let index = 0; index < ArtIds.length; index++) {
    await Art.deleteMany({ artId: ArtIds[index].artId})
  }
  for (let index = 0; index < CarrierIds.length; index++) {
    await Carrier.deleteMany({carrierId: CarrierIds[index].carrierId});
  }
  for (let index = 0; index < DistributionIds.length; index++) {
    await Distribution.deleteMany({locationId: DistributionIds[index].distributionId});
  }
  return true;
}

module.exports = {
  addDistribution,
  removeDistribution,
  AddressIds,
  ArtistIds,
  ArtIds,
  CarrierIds,
  DistributionIds,
  DIST_DATA_INDEX
}
