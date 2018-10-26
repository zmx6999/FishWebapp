'use strict';
/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Chaincode query
 */

const Fabric_Client = require('fabric-client');
const path = require("path");
const fs = require("fs");
module.exports=function (options,success,error) {
    //
    var fabric_client = new Fabric_Client();

// setup the fabric network
    var channel = fabric_client.newChannel(options.channelId);
    var peerdata = fs.readFileSync("/opt/fabric/crypto-config/peerOrganizations/org"+options.orgid+".example.com/peers/peer"+options.peerid+".org"+options.orgid+".example.com/tls/ca.crt")
    var peer = fabric_client.newPeer("grpcs://peer"+options.peerid+".org"+options.orgid+".example.com:7051",{
        pem:Buffer.from(peerdata).toString()
    });
    channel.addPeer(peer);

//
    var member_user = null;
    var store_path = path.join(__dirname,"../hfc-key-store/Org"+options.orgid+"MSP");
    console.log('Store path:'+store_path);

// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
    Fabric_Client.newDefaultKeyValueStore({ path: store_path
    }).then((state_store) => {
        // assign the store to the fabric client
        fabric_client.setStateStore(state_store);
        var crypto_suite = Fabric_Client.newCryptoSuite();
        // use the same location for the state store (where the users' certificate are kept)
        // and the crypto store (where the users' keys are kept)
        var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
        crypto_suite.setCryptoKeyStore(crypto_store);
        fabric_client.setCryptoSuite(crypto_suite);

        // get the enrolled user from persistence, this user will sign all requests
        return fabric_client.getUserContext("user"+options.userid, true);
    }).then((user_from_store) => {
        if (user_from_store && user_from_store.isEnrolled()) {
            console.log('Successfully loaded user'+options.userid+' from persistence');
            member_user = user_from_store;
        } else {
            throw new Error('Failed to get user'+options.userid+'.... run registerUser.js');
        }

        // queryCar chaincode function - requires 1 argument, ex: args: ['CAR4'],
        // queryAllCars chaincode function - requires no arguments , ex: args: [''],
        const request = {
            //targets : --- letting this default to the peers assigned to the channel
            chaincodeId: options.chaincodeId,
            fcn: options.fcn,
            args: JSON.parse(options.args)
        };

        // send the query proposal to the peer
        return channel.queryByChaincode(request);
    }).then((query_responses) => {
        console.log("Query has completed, checking results");
        // query_responses could have more than one  results if there multiple peers were used as targets
        if (query_responses && query_responses.length == 1) {
            if (query_responses[0] instanceof Error) {
                console.error("error from query = ", query_responses[0]);
                error("error from query = ", query_responses[0]);
            } else {
                console.log("Response is ", query_responses[0].toString());
                success(JSON.parse(query_responses[0].toString()));
            }
        } else {
            console.log("No payloads were returned from query");
            success();
        }
    }).catch((err) => {
        console.error('Failed to query successfully :: ' + err);
        error('Failed to query successfully :: ' + err);
    });
};