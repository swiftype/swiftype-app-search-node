const assert = require('assert')
const SwiftypeAppSearchClient = require('../lib/swiftypeAppSearch')
const replay = require('replay')

describe('SwiftypeAppSearchClient', () => {
  const hostIdentifier = 'host-c5s2mj'
  const apiKey = 'api-mu75psc5egt9ppzuycnc2mc3'
  const engineName = 'swiftype-api-example'
  const documents = [
    {
      id: 'INscMGmhmX4',
      url: 'http://www.youtube.com/watch?v=v1uyQZNg2vE',
      title: 'The Original Grumpy Cat',
      body: 'this is a test'
    },
    {
      id: 'JNDFojsd02',
      url: 'http://www.youtube.com/watch?v=tsdfhk2j',
      title: 'Another Grumpy Cat',
      body: 'this is also a test'
    }
  ]

  const swiftype = new SwiftypeAppSearchClient(hostIdentifier, apiKey)

  describe('#indexDocument', () => {
    it('should index a document successfully', (done) => {
      swiftype.indexDocument(engineName, documents[0])
      .then((result) => {
        assert.deepEqual({ "id": "INscMGmhmX4" }, result)
        done()
      })
      .catch((error) => {
        done(error)
      })
    })
  })

  describe('#indexDocuments', () => {
    it('should index documents successfully', (done) => {
      swiftype.indexDocuments(engineName, documents)
      .then((results) => {
        assert.deepEqual([
          { "errors": [], "id": "INscMGmmX4" },
          { "errors": [], "id": "JNDFojsd02" }
        ], results)
        done()
      })
      .catch((error) => {
        done(error)
      })
    })
  })

  describe('#getDocuments', () => {
    const documentIds = documents.map((d) => d.id)

    it('should get documents successfully', (done) => {
      swiftype.getDocuments(engineName, documentIds)
      .then((results) => {
        assert.deepEqual([
          {
            "body": "this is a test",
            "id": "INscMGmhmX4",
            "title": "The Original Grumpy Cat",
            "url": "http://www.youtube.com/watch?v=v1uyQZNg2vE",
          },
          {
            "body": "this is also a test",
            "id": "JNDFojsd02",
            "title": "Another Grumpy Cat",
            "url": "http://www.youtube.com/watch?v=tsdfhk2j",
          }
        ], results)
        done()
      })
      .catch((error) => {
        done(error)
      })
    })
  })

  describe('#destroyDocuments', () => {
    it('should destroy documents', (done) => {
      swiftype.destroyDocuments(engineName, ["INscMGmhmX4", "FakeId"])
      .then((results) => {
        assert.deepEqual([
          { "id": "INscMGmhmX4", "result": true },
          { "id": "FakeId", "result": false },
        ], results)
        done()
      })
      .catch((error) => {
        done(error)
      })
    })
  })

  describe('#listEngines', () => {
    it('should list engines successfully', (done) => {
      swiftype.listEngines()
      .then((results) => {
        assert.deepEqual({
          "meta": {
            "page": {
              "current": 1,
              "total_pages": 1,
              "total_results": 3,
              "size": 25
            }
          },
          "results": [{
            "name": "node-modules"
          }, {
            "name": "ruby-gems"
          }, {
            "name": "test-engine"
          }]
        }, results)
        done()
      })
      .catch((error) => {
        done(error)
      })
    })

    it('should support paging', (done) => {
      swiftype.listEngines({
        page: {
          current: 2,
          size: 1
        }
      })
      .then((results) => {
        assert.deepEqual({
          "meta": {
            "page": {
              "current": 2,
              "total_pages": 3,
              "total_results": 3,
              "size": 1
            }
          },
          "results": [{
            "name": "ruby-gems"
          }]
        }, results)
        done()
      })
      .catch((error) => {
        done(error)
      })
    })
  })

  describe('#getEngine', () => {
    it('should get an engine successfully', (done) => {
      swiftype.getEngine(engineName)
      .then((results) => {
        assert.deepEqual({
          "name": "swiftype-api-example"
        }, results)
        done()
      })
      .catch((error) => {
        done(error)
      })
    })
  })

  describe('#createEngine', () => {
    it('should create an engine successfully', (done) => {
      swiftype.createEngine("new-engine")
      .then((results) => {
        assert.deepEqual({
          "name": "new-engine"
        }, results)
        done()
      })
      .catch((error) => {
        done(error)
      })
    })
  })

  describe('#destroyEngine', () => {
    it('should delete an engine successfully', (done) => {
      swiftype.destroyEngine("new-engine")
      .then((results) => {
        assert.deepEqual({
          "deleted": true
        }, results)
        done()
      })
      .catch((error) => {
        done(error)
      })
    })
  })

  describe('#search', () => {
    it('should query', (done) => {
      swiftype.search(engineName, 'cat')
      .then((resp) => {
        assert.deepEqual([
          { raw: 'The Original Grumpy Cat' },
          { raw: 'Another Grumpy Cat' }
        ], resp.results.map((r) => r.title ))
        done()
      })
      .catch((error) => {
        done(error)
      })
    })
  })

  describe('#createSignedSearchKey', () => {
    it('should build a valid jwt', (done) => {
      token = SwiftypeAppSearchClient.createSignedSearchKey('api-mu75psc5egt9ppzuycnc2mc3', 'my-token-name', { query: 'cat' })
      jwt = require('jsonwebtoken')
      decoded = jwt.verify(token, 'api-mu75psc5egt9ppzuycnc2mc3')
      assert.equal(decoded.api_key_name, 'my-token-name')
      assert.equal(decoded.query, 'cat')
      done()
    })
  })
})
