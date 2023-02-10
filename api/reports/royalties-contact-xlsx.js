/**
 * generate a xslx file with all artist for merging the mail
 *
 * Version: 1.0.0  2023-02-10 @Jay
 */
const Path = require('path');
const Fs = require('fs')
const QueryRoyalties = require("../lib/query/query-royalty");
const JsonFile = require("jsonfile");

const MongoAsExcel = require('../lib/mongo-as-excel');
const ReportRoyaltArtist = require("./report-royalty-artist");


class RoyaltiesContactXlsx extends MongoAsExcel {

}

module.exports = RoyaltiesContactXlsx;
