import { Button, Col, Form, Input, Select, Modal, Row } from 'antd';
import React, { useState } from 'react';

const { Option } = Select;

export default function AccountPlan() {
  const [managerId, setManagerId] = useState<string>('');
  const [managerName, setManagerName] = useState<string>('');
  const [competentAuthorityName, setCompetentAuthorityName] =
    useState<String>('');
  const [financeGoal, setFinancialGoal] = useState<Number>(0);
  const [directorId, setDirectorId] = useState<string>('');
  const [directorName, setDirectorName] = useState<string>('');
  const [purchaseLimit, setPurchaseLimit] = useState<Number>(0);

  return (
    <Modal
      title="Cadastro de Plano de Conta"
      width={1000}
      visible={true}
      onCancel={() => {
        ('');
      }}
      footer={[
        <Button
          key="back"
          onClick={() => {
            ('');
          }}
          type="default"
        >
          Cancelar
        </Button>,
        <Button key="submit" type="primary">
          Salvar
        </Button>,
      ]}
    >
      <Row gutter={10}>
        <Col span={9}>
          <Form.Item
            key="nameFormItem"
            labelCol={{ span: 23 }}
            label="Nome:"
            labelAlign={'left'}
            style={{
              backgroundColor: 'white',
            }}
            required
          >
            <Select
              key="supplierName"
              size="large"
              placeholder="Selecione o Gerente da Conta"
              value={managerId}
              onChange={(e) => {
                setManagerId(e.toString());
              }}
            >
              <Option key={'1'} value={'oi'}>
                {'oid'}
              </Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Modal>
  );
}
