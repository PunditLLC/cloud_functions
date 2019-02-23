// Copyright 2017 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const functions = require('firebase-functions');
var algoliasearch = require('algoliasearch');
var AylienNewsApi = require('aylien-news-api');
const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();


var apiInstance = new AylienNewsApi.DefaultApi();

// Configure API key authorization: app_id
var app_id = apiInstance.apiClient.authentications['app_id'];
app_id.apiKey = "eb030a5e";

// Configure API key authorization: app_key
var app_key = apiInstance.apiClient.authentications['app_key'];
app_key.apiKey = "911f4563d9c34c220a01e10dfe6219c1";
var field = "hashtags";

// CATEGORIES: GOVERNMENT, PUBLIC OFFICIALS, DEMOCRACY, SOCIAL ISSUE, WELFARE, SOCIAL ISSUES (GENERRAL)
var opts = {
    'language': ["en", "de"],
    'publishedAtStart': "NOW-1DAY",
    'publishedAtEnd': "NOW",
    'categoriesTaxonomy': "iptc-subjectcode",
    'categoriesId': ["11024000", "11000000", "11006000", "11006005", "11006008", "11024002", "14000000", "14015000", "14025000"],
    'sourceLocationsCountry': ["US"],
    'sortBy': 'social_shares_count'
};
var callback = function (error, data, response) {
    if (error) {
        console.error(error);
    } else {
        json_data = JSON.stringify(data);
        // console.log('API called successfully. Returned data: ' + json_data);

        console.log(data.trends);
        var db = admin.firestore();
        db.collection("top_trends").doc("top1").update({
            "hashtag": data.trends[0].value
        });
        db.collection("top_trends").doc("top2").update({
            "hashtag": data.trends[1].value
        });
        db.collection("top_trends").doc("top3").update({
            "hashtag": data.trends[2].value
        });
    }
};

exports.update_top_trends = functions.pubsub
    .topic('hourly-tick')
    .onPublish((message) => {

        apiInstance.listTrends(field, opts, callback);

        // console.log("This job is run every hour!");
        // if (message.data) {
        //     const dataString = Buffer.from(message.data, 'base64').toString();
        //     console.log(`Message Data: ${dataString}`);
        // }

        return true;
    });

// CHECK OUT CATEGORIES HERE: https://docs.aylien.com/newsapi/search-taxonomies/#search-labels-for-iptc-subject-codes


// // Create and Deploy Your First Cloud Functions
// // https://github.com/firebase/snippets-node/blob/20d7b8cdf8ee3e5ad5361adf4a2528840a10ffe5/firestore/extend-with-functions/functions/index.js#L15-L26
//

// [START trigger_new_document]
exports.createUser = functions.firestore
    .document('users/{userId}')
    .onCreate((snap, context) => {

        const newUser = snap.data();
        newUser.objectID = newUser.userId;
        console.log("********");
        console.log(newUser);
        console.log(context);

        // ************************************************
        // CREATING ALGOLIA CLIENT
        // ************************************************
        var client = algoliasearch('RTE7P5749Z', 'b8c4ee32db1d6ef15b63845029842828');
        var index = client.initIndex('pundit_search');
        index.addObject(newUser, function (err, content) {
            if (err) {
                console.error(err);
            } else {
                console.log(content);
            }
        }); // add a single object
        // ************************************************


        // ************************************************
        // DETERMINE THE DISTRICT OF USER
        // ************************************************

        // ************************************************
        // ALERTING DB THAT PROFILE IS DONE BEING CREATED
        snap.ref.update({
            profile_status: "created"
        });
        // ************************************************

        return "**ALGOLIA DONE**";
    });

// createUser({userId: 'v560n5tyWpegxe8J2VLXT5o7NPB3',firstname: 'Glenn',lastname: 'Parham',zipcode: '92606', photoURL:'https://lh4.googleusercontent.com/-SCwcLZdCLQ0/AAAAAAAAAAI/AAAAAAAAMg8/-Eylw6RbTLs/photo.jpg'})