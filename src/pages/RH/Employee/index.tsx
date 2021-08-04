import React from 'react';
import ButtonAddEmployee from './components/ButtonAddEmployee';

import TableEmployee from './components/TableEmployee';
import { Col, Layout, Row } from 'antd';

export default function index() {
  const data = [
    { key: '4', name: 'Jim Red', age: 32, address: 'London No. 2 Lake Park' },
    {
      key: '5',
      name: 'Kiriku',
      age: 21,
      address: 'Pont que Partiw. 2 Venezuela',
    },
  ];
  return (
    <div>
      <Layout>
        <Row justify="end">
          <Col>
            <ButtonAddEmployee />
          </Col>
        </Row>

        <TableEmployee data={data} />
      </Layout>
    </div>
  );
}
