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
  {addrId: 9987004, name: 'select-artist-4', locations: [{street: 'testStreet', number: '4', zipcode: '1001AA', city: 'Amsterdam', isDefault: true, usage: 'home'}]},

  // periods
  {addrId: 9986001, name: 'period-address-1', locations: [{street: 'testStreet', number: '1', zipcode: '1001AA', city: 'Amsterdam', isDefault: true, usage: 'all'}]}, // artist
  {addrId: 9986002, name: 'period-address-2', locations: [{street: 'testStreet', number: '1', zipcode: '1001AA', city: 'Amsterdam', isDefault: true, usage: 'all'}]}, // invoice

  // -- 'one contact with multiple artists'
  {addrId: 9985001, name: 'contact-multi-artist', locations: [{street: 'testStreet', number: '1', zipcode: '1001AA', city: 'Amsterdam', isDefault: true, usage: 'all'}]}, // artist


];
let ArtistIds = [

  {artistId: 999001, type: 'artist', royaltiesPeriod: 0, contacts: [{addr: 9999001, percentage: 100}]},
  {artistId: 999002, type: 'collective', royaltiesPeriod: 0, contacts: [{addr: 9999001, percentage: 60}, {addr: 9999003, percentage: 40}]},
  {artistId: 999003, type: 'artist', royaltiesPeriod: 0, percentage: 65, contacts: [{addr: 9999003, percentage: 100}]},
  {artistId: 999004, type: 'artist', royaltiesPeriod: 0, percentage: 65, contacts: [{addr: 9999004, percentage: 100}]},

  {artistId: 997001, type: 'artist', royaltiesPeriod: 0, contacts: [{addr: 9997001, percentage: 100}]},
  {artistId: 997002, type: 'collective', royaltiesPeriod: 0, contacts: [{addr: 9997001, percentage: 60}, {addr: 9999003, percentage: 40}]},
  {artistId: 997003, type: 'artist', percentage: 65, royaltiesPeriod: 0, contacts: [{addr: 9997003, percentage: 100}]},
  {artistId: 997004, type: 'artist', percentage: 65, royaltiesPeriod: 0, contacts: [{addr: 9997004, percentage: 100}]},

  // selecting
  {artistId: 9697002, type: 'artist', percentage: 65, royaltiesPeriod: 0, contacts: [{addr: 9987001, percentage: 100}]},
  {artistId: 9697003, type: 'artist', percentage: 65, royaltiesPeriod: 0, contacts: [{addr: 9987002, percentage: 100}]},
  // abramovic and ulay
   {artistId: 9697004, type: 'artist', percentage: 65, royaltiesPeriod: 1, contacts: [{addr: 9987003, percentage: 70}, {addr: 9987004, percentage: 30}]},
  // abramovic
  {artistId: 9697005, type: 'artist', percentage: 65, royaltiesPeriod: 0, contacts: [{addr: 9987003, percentage: 100}]},


  // error checking
  {artistId: 998001, type: 'artist', royaltiesPeriod: 0, contacts: [{addr: 9997001}]},                  // ok artist
  {artistId: 998002, type: 'artist', royaltiesPeriod: 0, contacts: [{addr: 9997001, percentage: 110}]}, // to much for the contact

  // period testing
  {artistId: 996001, type: 'artist - 1', royaltiesPeriod: 0, contacts: [{addr: 9986001, percentage: 100}]},               // artist per year
  {artistId: 996002, type: 'artist - 2', royaltiesPeriod: 1, contacts: [{addr: 9986001, percentage: 100}]},                  // artist per quarter

  // -- 'one contact with multiple artists'
  {artistId: 994001, type: 'artist - year', royaltiesPeriod: 0, contacts: [{addr: 9985001, percentage: 100}]},                  // artist per year
  {artistId: 994002, type: 'artist - quarter', royaltiesPeriod: 1, contacts: [{addr: 9985001, percentage: 100}]},                  // artist per quarter

  // validation errors
  {artistId: 993001, type: 'artist - ok', royaltiesPeriod: 1, contacts: [{addr: 9985001, percentage: 100}]},
  {artistId: 993002, type: 'artist - no contacts', royaltiesPeriod: 1, contacts: []},                                   // no contacts
  {artistId: 993003, type: 'artist - no contacts', royaltiesPeriod: 1, contacts: [{addr: 9985001, percentage: 110}]},   // too much

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
  {artId: 9997005, royaltiesPercentage: 0,    agents:[{artist: 9697004}] },  // work of A & U
  {artId: 9997006, royaltiesPercentage: 0,    agents:[{artist: 9697005}] },  // work of A


  // error - royalties
  {artId: 9996001, agents:[{artist: 998001}], royaltiesPercentage: 110,  }, // to much for the art
  {artId: 9996002, agents:[{artist: 998002}]},                              // to much for the contact

  // period
  {artId: 9995001, royaltiesPercentage: 0,    agents:[{artist: 996001}] },
  {artId: 9995002, royaltiesPercentage: 0,    agents:[{artist: 996002}] },
  {artId: 9995003, royaltiesPercentage: 0,    agents:[{artist: 996002}] },

  // -- 'one contact with multiple artists'
  {artId: 9994001, royaltiesPercentage: 0,    agents:[{artist: 994001}] }, // contact 1, artist 1, year
  {artId: 9994002, royaltiesPercentage: 0,    agents:[{artist: 994002}] },  // contact 1, artist 2, quarter
  {artId: 9994003, royaltiesPercentage: 0,    agents:[{artist: 994002}] },  // contact 1, artist 2, quarter

  // validation errors
  {artId: 9993001, royaltiesPercentage: 0,    agents:[] },                  // artist does not exist
  {artId: 9993002, royaltiesPercentage: 110,  agents:[{artist: 993001}] },  // too much royalties on art
  {artId: 9993003, royaltiesPercentage: 0,  agents:[{artist: 993002}] },  // no contacts
  {artId: 9993004, royaltiesPercentage: 0,  agents:[{artist: 993003}] },  // contacts: too much royalties on artist contacts

];
let CarrierIds = [
  {carrierId: 99997001, art: [{art: 9996001}]}
]

let DistributionIds = [
  // checks for data integrity
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

  // 2 lines, 2 artist, 3 contacts
  {distributionId: 99986007, addrInvoice: 9999002, rentalDate: -19, lines: [ // same artist 2 works
      {order: 'a-0', price: 200, art: 9997005 },                     // artistId: 9697004, contactId: 9987003, 9987004
      {order: 'a-1', price: 400, art: 9997004 },                     // artistId: 9697003, contactId: 9987002
      {order: 'a-2', price: 400, art: 9997006 }                      // artistId: 9697003, contactId: 9987002
    ],
  },

  // -- period
  {distributionId: 99956001, addrInvoice: 9986002, eventStartDate: '2010-02-01', lines: [ // artist - 1 per year
      {order: 'a-0', price: 200, art: 9995001 },                     //
    ],
  },
  {distributionId: 99956002, addrInvoice: 9986002, eventStartDate: '2010-02-01', lines: [ // artist - 2 per quarter
      {order: 'a-0', price: 200, art: 9995002 },                     //
    ],
  },
  {distributionId: 99956002, addrInvoice: 9986002, eventStartDate: '2010-04-01', lines: [ // artist - other quarter 2 per quarter
      {order: 'a-0', price: 200, art: 9995003 },                     //
    ],
  },

  // -- 'one contact with multiple artists'
  {distributionId: 99946001, addrInvoice: 9986002, eventStartDate: '2011-04-01', lines: [ // artist - other quarter 2 per quarter
      {order: 'a-0', price: 200, art: 9994001 },                     // contact 1, artist 1, year
      {order: 'a-1', price: 200, art: 9994002 },                     // contact 1, artist 1, quarter
    ],
  },
  {distributionId: 99946002, addrInvoice: 9986002, eventStartDate: '2011-04-01', lines: [ // artist - other quarter 2 per quarter
      {order: 'b-0', price: 200, art: 9994001 },                     // contact 1, artist 1, year
      {order: 'b-1', price: 200, art: 9994003 },                      // contact 1, artist 1, quarter
    ],
  },

  // validation errors
  {distributionId: 99946001, addrInvoice: 9986002, eventStartDate: '2012-04-01', lines: [
      {order: 'a-0', price: 200, art: 1 },                          // art does not exist
    ],
  },
  {distributionId: 99946002, addrInvoice: 9986002, eventStartDate: '2012-04-01', lines: [
      {order: 'a-0', price: 200, art: 9993001 },                    // artist does not exist
    ],
  },
  { distributionId: 99946003, addrInvoice: 9986002, eventStartDate: '2012-04-01', lines: [
      {order: 'a-0', price: 200, art: 9993002},                    // too much royalties on art
    ],
  },
  { distributionId: 99946004, addrInvoice: 9986002, eventStartDate: '2012-04-01', lines: [
      {order: 'a-0', price: 200, art: 9993003},                    // no contacts for art
    ],
  },
  { distributionId: 99946005, addrInvoice: 9986002, eventStartDate: '2012-04-01', lines: [
      {order: 'a-0', price: 200, art: 9993004},                    // contacts too much royalties
    ],
  }

]

const DIST_DATA_INDEX = {
  'royalties-data-art': DistributionIds.find(x => x.distributionId === 99996001),
  'royalties-data-carrier': DistributionIds.find(x => x.distributionId === 99996002),
  'royalties-artist': DistributionIds.find( x => x.distributionId === 99996003),
  'royalties-collective': DistributionIds.find( x => x.distributionId === 99996005),
  'royalties-multiline': DistributionIds.find( x => x.distributionId === 99996006),
  'royalties-error-agent-max': DistributionIds.find( x => x.distributionId === 99995001),
  'royalties-error-contact-max': DistributionIds.find( x => x.distributionId === 99995002),
  'royalties-contract-count': 5,
  'royalties-contact-count': 5,
  'royalties-line-count': 9,
  'royalties-artist-count': 4,                                // the number of artists in range
  'royalties-period-year': 2010,     // all year selection
  'royalties-period-all-count': 3,    // all year selection, found records
  'royalties-period-0-count': 2,      // quarter 1
  'royalties-period-1-count': 1,      // quarter 2
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
    let artist = await Artist.create(session, {agentId: ArtistIds[index].artistId, name: `artist.${ArtistIds[index].artistId}`, type: ArtistIds[index].type, percentage: ArtistIds[index].percentage, royaltiesPeriod: ArtistIds[index].royaltiesPeriod});
    for (let cntIndex = 0; cntIndex < ArtistIds[index].contacts.length; cntIndex++) {
      // let addrIndex = ArtistIds[index].contacts[cntIndex].index;
      let addr = AddressIds.find(addr => addr.addrId === ArtistIds[index].contacts[cntIndex].addr)
      try {
        artist.contacts.push({
          contact: addr.id,
          percentage: ArtistIds[index].contacts[cntIndex].percentage,
          isArtist: true
        })
      } catch (e) {
        console.error(`missing Address `, ArtistIds[index].contacts[cntIndex].addr)
      }
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
    let eventStartDate = DistributionIds[index].hasOwnProperty('eventStartDate') ?  Moment.utc(DistributionIds[index].eventStartDate).startOf('day') : Moment().add(DistributionIds[index].rentalDate, 'days').startOf('day');
    let distr = await Distribution.create(session, {locationId: DistributionIds[index].distributionId, event: `event.${DistributionIds[index].distributionId}`, invoice: invAddr.id, eventStartDate: eventStartDate});
    for (let lineIndex = 0; lineIndex < DistributionIds[index].lines.length; lineIndex++) {
      let line = DistributionIds[index].lines[lineIndex]
      // if (line.artIndex !== undefined) {
      //   distr.lines.push({order: line.order, art: ArtIds[line.artIndex].id, price: line.price})
      // } else
      if ( line.art !== undefined) {
        let i = ArtIds.findIndex( x => x.artId === line.art)
        try {
          distr.lines.push({order: line.order, art: ArtIds[i].id, price: line.price})
        } catch (e) {
          console.error('missing art, but still added the line', line.art)
          distr.lines.push({order: line.order, price: line.price})
        }
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
