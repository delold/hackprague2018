var erBase = require("eventregistry");
const er = new erBase.EventRegistry({apiKey: "b28c3acb-dfff-4cda-a9d2-d7ae03e3ead4"});
let axios = require('axios');
const language = require('@google-cloud/language');
const client = new language.LanguageServiceClient();
let text = 'President Trump continues to blame Democrats for his family separation approach on immigration';
const document = {
    content: text,
    type: 'PLAIN_TEXT',
};

async function getArticles (document) {
    client.
      analyzeEntities({document})
      .then(results => {
          var keywords = results[0].entities.map(result => result.name)
          const articleInfo = new erBase.ArticleInfoFlags({ duplicateList: true, concepts: true, categories: true, location: true, image: true });
          const returnInfo = new erBase.ReturnInfo({articleInfo});
          const requestArticlesInfo = new erBase.RequestArticlesInfo({count: 30, returnInfo: returnInfo});
          const q2 = new erBase.QueryArticles({ keywords });
          q2.setRequestedResult(requestArticlesInfo);
          er.execQuery(q2).then((responses) => {
              responses.articles.results.forEach(element => {
                  console.info(element.url);
              });
          });
      })
}


getArticles(document);
