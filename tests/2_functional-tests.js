const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testId;

  test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue',
        created_by: 'Functional Test',
        assigned_to: 'Chai',
        status_text: 'In QA'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_by');
        assert.property(res.body, 'assigned_to');
        assert.property(res.body, 'status_text');
        assert.property(res.body, '_id');
        testId = res.body._id;
        done();
      });
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Required Fields',
        issue_text: 'This is a test with only required fields',
        created_by: 'Functional Test'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'issue_title');
        assert.property(res.body, 'issue_text');
        assert.property(res.body, 'created_by');
        assert.property(res.body, 'assigned_to');
        assert.property(res.body, 'status_text');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        done();
      });
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Missing Fields'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('View issues on a project: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/apitest')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'open');
        assert.property(res.body[0], 'status_text');
        assert.property(res.body[0], '_id');
        done();
      });
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/apitest')
      .query({created_by: 'Functional Test'})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'created_by');
        assert.equal(res.body[0].created_by, 'Functional Test');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'open');
        assert.property(res.body[0], 'status_text');
        assert.property(res.body[0], '_id');
        done();
      });
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
    chai.request(server)
      .get('/api/issues/apitest')
      .query({created_by: 'Functional Test', open: true})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach((issue) => {
          assert.equal(issue.created_by, 'Functional Test');
          assert.isTrue(issue.open);
        });
        done();
      });
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({_id: testId, issue_text: 'This text was updated'})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: testId, 
        issue_text: 'This text was updated again',
        open: false
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({issue_text: 'No ID provided'})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({_id: testId})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({_id: 'invalid_id', issue_text: 'Should not update'})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body._id, 'invalid_id');
        done();
      });
  });

  test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({_id: testId})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, testId);
        
        // Verify that the issue has been deleted
        chai.request(server)
          .get('/api/issues/apitest')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            let deletedIssue = res.body.find(issue => issue._id === testId);
            assert.isUndefined(deletedIssue);
            done();
          });
      });
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({_id: 'invalid_id'})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'could not delete');
        assert.equal(res.body._id, 'invalid_id');
        done();
      });
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});