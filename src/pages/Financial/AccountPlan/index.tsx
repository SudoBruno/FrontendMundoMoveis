import QuestionCircleOutlined from '@ant-design/icons/lib/icons/QuestionCircleOutlined';
import { Button, Col, Form, Input, Select, Modal, Row, Popover } from 'antd';
import React, { useState } from 'react';

const { Option } = Select;

export default function AccountPlan() {
  const [managerId, setManagerId] = useState<string>('');
  const [managerName, setManagerName] = useState<string>('');
  const [competentAuthorityId, setCompetentAuthorityId] = useState<string>('');
  const [financeGoal, setFinancialGoal] = useState<Number>(0);
  const [directorId, setDirectorId] = useState<string>('');
  const [directorName, setDirectorName] = useState<string>('');
  const [purchaseLimit, setPurchaseLimit] = useState<Number>(0);
  const [goalLimitInPercent, setGoalLimitInPercent] = useState<Number>(0);

  const popOverPurchaseLimitContent = (
    <>
      {' '}
      <p>
        O limite de compra é a quantidade estipulada de uma compra,
        <br />
        que quando excedido o diretor responsável deve ser acionado
        <br />
        para a efetuar a autorização da mesma
      </p>
    </>
  );

  const popOverGoalLimitContent = (
    <>
      {' '}
      <p>
        O limite da meta é a quantidade máxima
        <br /> em porcentagem {`(%)`} da meta de gasto,
        <br />
        que quando excedido {`(ex: 85% do total)`} <br />
        o diretorresponsável deve ser acionado
        <br />
        para a efetuar a autorização de comprar excedentes.
      </p>
    </>
  );

  return (
    <Modal
      title="Cadastro de Plano de Conta"
      width={1100}
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
      <Row gutter={5}>
        <Col span={7}>
          <Form.Item
            key="nameFormItem"
            labelCol={{ span: 20 }}
            label="Limite de Compra:"
            labelAlign={'left'}
            style={{
              backgroundColor: 'white',
            }}
            required
          >
            <Input
              type="number"
              key="quantiyKey"
              size="large"
              style={{ width: '80%', marginRight: '2%' }}
              onChange={(e) => {
                setPurchaseLimit(Number(e.target.value));
              }}
            />
            <Popover
              content={popOverPurchaseLimitContent}
              title="O que é o limite de compra ?"
            >
              <QuestionCircleOutlined
                style={{ fontSize: '20px', cursor: 'pointer' }}
              />
            </Popover>
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item
            key="goalLimitFormItem"
            labelCol={{ span: 20 }}
            label="Limite da meta (%):"
            labelAlign={'left'}
            style={{
              backgroundColor: 'white',
            }}
            required
          >
            <Input
              type="number"
              key="quantiyKey"
              size="large"
              style={{ width: '80%', marginRight: '2%' }}
              onChange={(e) => {
                setPurchaseLimit(Number(e.target.value));
              }}
            />
            <Popover
              content={popOverGoalLimitContent}
              title="O que é o limite de meta ?"
            >
              <QuestionCircleOutlined
                style={{ fontSize: '20px', cursor: 'pointer' }}
              />
            </Popover>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={5}>
        <Col span={7}>
          <Form.Item
            key="nameFormItem"
            labelCol={{ span: 23 }}
            label="Nome do Gerente:"
            labelAlign={'left'}
            style={{
              backgroundColor: 'white',
            }}
            required
          >
            <Select
              key="managerName"
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
        <Col span={7}>
          <Form.Item
            key="competentAuthorityNameFormItem"
            labelCol={{ span: 23 }}
            label="Autoridade Competente:"
            labelAlign={'left'}
            style={{
              backgroundColor: 'white',
            }}
            required
          >
            <Select
              key="competentAuthorityNameSelect"
              size="large"
              value={competentAuthorityId}
              onChange={(e) => {
                setCompetentAuthorityId(e.toString());
              }}
            >
              <Option key={'1'} value={'oi'}>
                {'oid'}
              </Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item
            key="directorFormItem"
            labelCol={{ span: 23 }}
            label="Diretor:"
            labelAlign={'left'}
            style={{
              backgroundColor: 'white',
            }}
            required
          >
            <Select
              key="dirctorName"
              size="large"
              value={directorId}
              onChange={(e) => {
                setDirectorId(e.toString());
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
