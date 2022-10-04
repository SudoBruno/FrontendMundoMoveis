import {
  PlusOutlined,
} from '@ant-design/icons';

import {
  Button,
  Col,
  Form,
  Input,
  Layout,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
} from 'antd';

import React, { FormEvent, useState } from 'react';
import Highlighter from 'react-highlight-words';
import styles from '../../../styles/app.module.scss';

import { Notification } from '../../../components/Notification';
import { api } from '../../../services/api';
import { GetServerSideProps } from 'next';
import { getAPIClient } from '../../../services/axios';
import isequal from "lodash.isequal";
import get from "lodash.get";

const { Option } = Select;

interface IProps {
  productionLine: any;
  subLine: any;
}

export default function TaskDistribution() {
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div>
      <Layout>
        <Row justify="center">
          <Col>
            <Button
              size={'large'}
              className={styles.button}
              icon={<PlusOutlined style={{ fontSize: '16px' }} />}
              onClick={() => setModalIsOpen(true)}
            >
              Novo Balanceamento
            </Button>
          </Col>
        </Row>
      </Layout>

      <Modal
        title="Distribuição Herbert Richards"
        visible={modalIsOpen}
        onCancel={() => setModalIsOpen(false)}
        footer={[
          <Button key="back"
            onClick={() => setModalIsOpen(false)}
            type="default"
          >
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => setModalIsOpen(false)}
          >
            Salvar
          </Button>,
        ]}
      >
        <Form.Item
          label="Quantidade de Pessoas"
        >
          <Input placeholder="40" type="number" />
        </Form.Item>
        <Form.Item
          label="Produto:"
        >
          <Select
            showSearch
            placeholder="Ex: Lubeck"
          >
            {['Lubeckinho', 'Livingzinho'].map((item) => (
              <>
                <Option>
                  {item}
                </Option>
              </>

            ))}
          </Select>
        </Form.Item>
      </Modal>
    </div>
  );
}

function getServerSideProps() {

}