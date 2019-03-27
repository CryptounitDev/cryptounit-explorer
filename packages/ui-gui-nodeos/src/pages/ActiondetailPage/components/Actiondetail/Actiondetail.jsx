import React from 'react';

import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Col, Form, FormGroup, Label } from 'reactstrap';

const Actiondetail = (props) => {

  let { actiondetailPage: { data } } = props;
  let { payload } = data;

  return (
    <>
      { payload.map((action, index) =>
        <Form key={index} className="form-horizontal">
          <FormGroup row className="mb-0">
            <Col xs="3">
              <Label><strong>Smart Contract Name</strong></Label>
            </Col>
            <Col xs="9">
              <p className="form-control-static">{action && action.act.account}</p>
            </Col>
          </FormGroup>
          <FormGroup row className="mb-0">
            <Col xs="3">
              <Label><strong>Action Type</strong></Label>
            </Col>
            <Col xs="9">
              <p className="form-control-static">{action && action.act.name}</p>
            </Col>
          </FormGroup>
          <FormGroup row className="mb-0">
            <Col xs="3">
              <Label><strong>Timestamp</strong></Label>
            </Col>
            <Col xs="9">
              <p className="form-control-static">{action && action.createdAt}</p>
            </Col>
          </FormGroup>
          <FormGroup row className="mb-0">
            <Col xs="3">
              <Label><strong>Transaction ID</strong></Label>
            </Col>
            <Col xs="9">
              {/* <Link to={`/transaction/${eachTransaction.trx_id}`}>{eachTransaction.trx_id}</Link> */}
              <p className="form-control-static">
                {action && <Link to={`/transaction/${action.trx_id}`}>{action.trx_id}</Link> }
              </p>
            </Col>
          </FormGroup>
          <FormGroup row className="mb-0">
            <Col xs="3">
              <Label><strong>Actor</strong></Label>
            </Col>
            <Col xs="9">
              <p className="form-control-static">
                { action && (action.act && (action.act.authorization && 
                  action.act.authorization.map((auth, i) => (
                    auth.actor + (i > 0 && i < (action.act.authorization.length - 1) ? ", " : "")
                  )
                ))) }
              </p>
            </Col>
          </FormGroup>
        </Form>
      )}
    </>
  );
}

export default connect(
  ({ actiondetailPage, router}) => ({
    actiondetailPage,
    router
  })
)(Actiondetail);
