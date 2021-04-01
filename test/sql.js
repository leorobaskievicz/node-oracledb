/* Copyright (c) 2017, 2021, Oracle and/or its affiliates. All rights reserved. */

/******************************************************************************
 *
 * You may not use the identified files except in compliance with the Apache
 * License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * The node-oracledb test suite uses 'mocha', 'should' and 'async'.
 * See LICENSE.md for relevant licenses.
 *
 * NAME
 *   sql.js
 *
 * DESCRIPTION
 *   generate sql
 *****************************************************************************/
'use strict';
var should   = require('should');
var async    = require('async');

var sql = exports;
module.exports = sql;

sql.createTable = function(tableName, dataType) {
  var element = dataType;
  if (dataType === "CHAR") {
    element = element + "(1000)";
  }
  if (dataType === "NCHAR") {
    element = element + "(1000)";
  }
  if (dataType === "VARCHAR2") {
    element = element + "(1000)";
  }
  if (dataType === "RAW") {
    element = element + "(1000)";
  }

  var sql = "BEGIN \n" +
            "    DECLARE \n" +
            "        e_table_missing EXCEPTION; \n" +
            "        PRAGMA EXCEPTION_INIT(e_table_missing, -00942);\n" +
            "    BEGIN \n" +
            "        EXECUTE IMMEDIATE ('DROP TABLE " + tableName + " PURGE' ); \n" +
            "    EXCEPTION \n" +
            "        WHEN e_table_missing \n" +
            "        THEN NULL; \n" +
            "    END; \n" +
            "    EXECUTE IMMEDIATE ( ' \n" +
            "        CREATE TABLE " + tableName + " ( \n" +
            "            id        NUMBER, \n" +
            "            content   " + element + " \n" +
            "        ) \n" +
            "    '); \n" +
            "END;  ";
  return sql;
};

sql.createAllTable = function(tableName, dataTypeArray) {
  var sql = "BEGIN \n" +
            "    DECLARE \n" +
            "        e_table_missing EXCEPTION; \n" +
            "        PRAGMA EXCEPTION_INIT(e_table_missing, -00942);\n" +
            "    BEGIN \n" +
            "        EXECUTE IMMEDIATE ('DROP TABLE " + tableName + " PURGE' ); \n" +
            "    EXCEPTION \n" +
            "        WHEN e_table_missing \n" +
            "        THEN NULL; \n" +
            "    END; \n" +
            "    EXECUTE IMMEDIATE ( ' \n" +
            "        CREATE TABLE " + tableName + " ( \n" +
            "            id    NUMBER, \n" ;

  async.eachSeries(dataTypeArray, function(element, cb) {
    var index = dataTypeArray.indexOf(element);
    var length = dataTypeArray.length;
    var col_name = "col_" + (index + 1);
    var col_type = element;
    var isLast;

    if (col_type === "CHAR") {
      element = element + "(2000)";
    }
    if (col_type === "NCHAR") {
      element = element + "(1000)";
    }
    if (col_type === "VARCHAR2") {
      element = element + "(4000)";
    }
    if (col_type === "RAW") {
      element = element + "(2000)";
    }
    isLast = (index == (length - 1)) ? true : false;
    sql = appendSql(sql, col_name, element, isLast);
    cb();
  }, function(err) {
    should.not.exist(err);
  });
  sql = sql +
        "        ) \n" +
        "    '); \n" +
        "END;  ";
  return sql;
};

sql.executeSql = function(connection, sql, bindVar, option, callback) {
  connection.execute(
    sql,
    bindVar,
    option,
    function(err) {
      should.not.exist(err);
      callback();
    }
  );
};

sql.executeInsert = function(connection, sql, bindVar, option, callback) {
  connection.execute(
    sql,
    bindVar,
    option,
    function(err, result) {
      should.not.exist(err);
      (result.rowsAffected).should.be.exactly(1);
      callback();
    }
  );
};

sql.executeSqlWithErr = function(connection, sql, bindVar, option, callback) {
  connection.execute(
    sql,
    bindVar,
    option,
    function(err) {
      should.exist(err);
      callback(err);
    }
  );
};

sql.createRowid = function(connection, rowid_type, object_number, relative_fno, block_number, row_number, callback) {
// Parameter       Description
// rowid_type      Type (restricted or extended), set the rowid_type parameter to 0 for a restricted ROWID. Set it to 1 to create an extended ROWID.
//                 If you specify rowid_type as 0, then the required object_number parameter is ignored, and ROWID_CREATE returns a restricted ROWID.
// object_number   The data object number for the ROWID. For a restricted ROWID, use the ROWID_OBJECT_UNDEFINED constant.
// relative_fno    The relative file number for the ROWID.
// block_number    The block number for the ROWID.
// row_number      The row number for the ROWID.
  var myRowid = "";
  connection.execute(
    "select DBMS_ROWID.ROWID_CREATE(" + rowid_type + ", " + object_number + ", " + relative_fno + ", " + block_number + ", " + row_number + ") create_rowid from dual",
    function(err, result) {
      should.not.exist(err);
      myRowid = result.rows[0][0];
      callback(myRowid);
    }
  );
};
var appendSql = function(sql, col_name, col_type, isLast) {
  if (isLast === true) {
    sql = sql + "            " + col_name + " " + col_type + " \n";
  } else {
    sql = sql + "            " + col_name + " " + col_type + ", \n";
  }
  return sql;
};
