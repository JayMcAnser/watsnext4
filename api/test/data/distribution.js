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
  {addrId: 9999001, name: 'artist-1', locations: []},
  {addrId: 9999002, name: 'contract-1'},
  {addrId: 9999003, name: 'location-1'},
  {addrId: 9999004, name: 'artist-2'},


  {addrId: 9997001, name: 'artist-1', locations: []},
  {addrId: 9997002, name: 'contract-1', locations: []},
  {addrId: 9997003, name: 'location-1', locations: []},
  {addrId: 9997004, name: 'artist-2', locations: [{street: 'testStreet', number: '123', zipcode: '1000AA', city: 'Amsterdam', isDefault: true, usage: 'all'}]},

  // selecting
  {addrId: 9987001, name: 'select-artist-1', locations: [{street: 'testStreet', number: '1', zipcode: '1001AA', city: 'Amsterdam', isDefault: true, usage: 'all'}]},
  {addrId: 9987002, name: 'select-artist-2', locations: [{street: 'testStreet', number: '2', zipcode: '1001AA', city: 'Amsterdam', isDefault: true, usage: 'post'}]},
  {addrId: 9987003, name: 'select-artist-3', locations: [{street: 'testStreet', number: '3', zipcode: '1001AA', city: 'Amsterdam', isDefault: false, usage: 'home'}, {street: 'testStreet', number: '3', zipcode: '1001AA', city: 'Amsterdam', isDefault: true, usage: 'post'}]},
  {addrId: 9987004, name: 'select-artist-3', locations: [{street: 'testStreet', number: '4', zipcode: '1001AA', city: 'Amsterdam', isDefault: true, usage: 'home'}]},

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

  // selecting
  {artistId: 9697002, type: 'artist', percentage: 65,      contacts: [{addr: 9987001, percentage: 100}]},
  {artistId: 9697003, type: 'artist', percentage: 65,      contacts: [{addr: 9987002, percentage: 100}]},
  {artistId: 9697004, type: 'artist', percentage: 65,      contacts: [{addr: 9987003, percentage: 70}, {addr: 9987004, percentage: 30}]},
 //  {artistId: 9697005, type: 'artist', percentage: 65,      contacts: [{addr: 9987003, percentage: 100}]},

  // error checking
  {artistId: 998001, type: 'artist', contacts: [{addr: 9997001}]},                  // ok artist
  {artistId: 998002, type: 'artist', contacts: [{addr: 9997001, percentage: 110}]}, // to much for the contact
];


let ArtIds = [
  {artId: 9998001, royaltiesPercentage: 100,  agents:[{artist: 999001}] },
  {artId: 9998002, royaltiesPercentage: 0,    agents:[{artist: 999002}] },
  {artId: 9998003, royaltiesPercentage: 0,    agents:[{artist: 999003}] },
  {artId: 9998004, royaltiesPercentage: 0,    agents:[{artist: 999004}] },

  // selecting
  // {artId: 9997001, royaltiesPercentage: 100,  agents:[{artist: 997001}] },
  {artId: 9997002, royaltiesPercentage: 0,    agents:[{artist: 9697002}] },
  {artId: 9997003, royaltiesPercentage: 0,    agents:[{artist: 9697003}] },
  {artId: 9997004, royaltiesPercentage: 0,    agents:[{artist: 9697003}] },  // same artist two work
  {artId: 9997005, royaltiesPercentage: 0,    agents:[{artist: 9697004}] },


  // error - royalties
  {artId: 9996001, agents:[{artist: 998001}], royaltiesPercentage: 110,  }, // to much for the art
  {artId: 9996002, agents:[{artist: 998002}]},                              // to much for the contact

];
let CarrierIds = [
  {carrierId: 99997001, art: [{art: 9996001}]}
]

let DistributionIds = [
  // checks for data integrety
  {distributionId: 99996001, addrInvoice: 9999002, rentalDate: -1, lines: [
      {order: 'a-0', price: 1000, art: 9998001 }]
  },
  {distributionId: 99996002, addrInvoice: 9999002, rentalDate: -1, lines: [
      {order: 'a-0', price: 1000, carrier: 99997001 }]
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
  // artwork has to much royalties
  {distributionId: 99995001, addrInvoice: 9999001, rentalDate: -30, lines: [
      {order: 'a-0', price: 1000, art: 9996001 }]
  },
  {distributionId: 99995002, addrInvoice: 9999001, rentalDate: -30, lines: [
      {order: 'a-0', price: 1000, art: 9996002 }]
  },


  // selecting
  {distributionId: 99986003, addrInvoice: 9999002, rentalDate: -20, lines: [
      {order: 'a-0', price: 200, art: 9997002 }]                      // artistId: 9697002, contactId: 9987001
  },
  {distributionId: 99986004, addrInvoice: 9999002, rentalDate: -20, lines: [
      {order: 'a-0', price: 1000, art: 9997002 },                     // artistId: 9697002, contactId: 9987001
      {order: 'a-0', price: 1000, art: 9997003 }]                     // artistId: 9697003, contactId: 9987002
  },
  {distributionId: 99986005, addrInvoice: 9999002, rentalDate: -20, lines: [
      {order: 'a-0', price: 200, art: 9997002 }]                      // artistId: 9697002, contactId: 9987001
  },
  {distributionId: 99986006, addrInvoice: 9999002, rentalDate: -20, lines: [ // same artist 2 works
      {order: 'a-0', price: 200, art: 9997003 },                     // artistId: 9697003, contactId: 9987002
      {order: 'a-1', price: 400, art: 9997004 }                      // artistId: 9697003, contactId: 9987002
    ],
  },
  {distributionId: 99986007, addrInvoice: 9999002, rentalDate: -20, lines: [ // same artist 2 works
      {order: 'a-0', price: 200, art: 9997005 },                     // artistId: 9697004, contactId: 9987003, 9987004
    ],
  },
]

const DIST_DATA_INDEX = {
  'royalties-data-art': DistributionIds.find(x => x.distributionId === 99996001),
  'royalties-data-carrier': DistributionIds.find(x => x.distributionId === 99996002),
  'royalties-artist': DistributionIds.find( x => x.distributionId === 99996003),
  'royalties-collective': DistributionIds.find( x => x.distributionId === 99996005),
  'royalties-multiline': DistributionIds.find( x => x.distributionId === 99996006),
  'royalties-error-agent-max': DistributionIds.find( x => x.distributionId === 99995001),
  'royalties-error-contact-max': DistributionIds.find( x => x.distributionId === 99995002),
  'royalties-contact-count': 5,
  'royalties-line-count': 7,
  'royalties-artist-count': 4,                                // the number of artists in range
}

const selectArtist = function(agentId) {
  const ARTIST_SELECT = {
    '9697002': {
      eventCount: 3,
      lineCount: 3,
      contactCount: 1
    },
    '9697003': {
      eventCount: 2,
      lineCount: 3,
      contactCount: 1
    },
    '9697004': {
      eventCount: 1,
      lineCount: 1,
      contactCount: 1
    },
    '9697005': {
      eventCount: 1,
      lineCount: 1,
      contactCount: 2
    }
  }
  if (ARTIST_SELECT.hasOwnProperty(agentId)) {
    return ARTIST_SELECT[agentId]
  }
  return {}
}

const addDistribution = async function(session) {
  if (!session) {
    return 'missing session';
  }
  for (let index = 0; index < AddressIds.length; index++) {
    let addrInfo = AddressIds[index];
    let contact = await Contact.create(session, {
      contactId: addrInfo.addrId,
      name: addrInfo.name,
      locations: []
    });
    if (addrInfo.locations) {
      for (let locIndex = 0; locIndex < addrInfo.locations.length; locIndex++) {
        let loc = addrInfo.locations[locIndex];
        // contact.locationAdd(loc);
        contact.locations.push(loc);
      }
    }
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
      // art.agents.push({agent: artist.id, percentage:  ArtIds[index].agents[agIndex].percentage})
      await art.agentAdd({agent: artist.id, percentage:  ArtIds[index].agents[agIndex].percentage})
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
      // if (line.artIndex !== undefined) {
      //   distr.lines.push({order: line.order, art: ArtIds[line.artIndex].id, price: line.price})
      // } else
      if ( line.art !== undefined) {
        let i = ArtIds.findIndex( x => x.artId === line.art)
        distr.lines.push({order: line.order, art: ArtIds[i].id, price: line.price})
      } else if (line.carrier !== undefined) {
        let i = CarrierIds.findIndex( x => x.carrierId === line.carrier)
        distr.lines.push({order: line.order, carrier: CarrierIds[i].id, price: line.price})
      } else {
        console.error('distribution.data: missing art and carrier')
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
  DIST_DATA_INDEX,
  selectArtist
}
