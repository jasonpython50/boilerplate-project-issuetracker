'use strict';

let issuesStorage = {};

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res) {
      let project = req.params.project;
      let issues = issuesStorage[project] || [];
      
      // Filter issues based on query parameters
      Object.keys(req.query).forEach(key => {
        issues = issues.filter(issue => issue[key] == req.query[key]);
      });
      
      res.json(issues);
    })
    
    .post(function (req, res) {
      let project = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      
      let newIssue = {
        _id: Date.now().toString(),
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      };
      
      if (!issuesStorage[project]) {
        issuesStorage[project] = [];
      }
      issuesStorage[project].push(newIssue);
      
      res.json(newIssue);
    })
    
    .put(function (req, res) {
      let project = req.params.project;
      let { _id, ...updateFields } = req.body;
      
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }
      
      let issues = issuesStorage[project] || [];
      let issueIndex = issues.findIndex(issue => issue._id === _id);
      
      if (issueIndex === -1) {
        return res.json({ error: 'could not update', '_id': _id });
      }
      
      Object.assign(issues[issueIndex], updateFields);
      issues[issueIndex].updated_on = new Date();
      
      res.json({ result: 'successfully updated', '_id': _id });
    })
    
    .delete(function (req, res) {
      let project = req.params.project;
      let { _id } = req.body;
      
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      if (!issuesStorage[project]) {
        return res.json({ error: 'could not delete', '_id': _id });
      }

      let initialLength = issuesStorage[project].length;
      issuesStorage[project] = issuesStorage[project].filter(issue => issue._id !== _id);
      
      if (issuesStorage[project].length === initialLength) {
        return res.json({ error: 'could not delete', '_id': _id });
      }
      
      res.json({ result: 'successfully deleted', '_id': _id });
    });
};