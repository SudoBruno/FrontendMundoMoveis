import React, { FormEvent, useState } from 'react';

import {
  Button,
  Col,
  Form,
  Input,
  Select,
  Modal,
  Row,
  Popover,
  Table,
  Popconfirm,
  Space,
  Layout,
} from 'antd';
import { GetServerSideProps } from 'next';
import { Notification } from '../../../components/Notification';
import { getAPIClient } from '../../../services/axios';
import Highlighter from 'react-highlight-words';
import styles from '../../../styles/app.module.scss';
import { api } from '../../../services/api';
import {
  PlusOutlined,
  DeleteOutlined,
  EditFilled,
  SearchOutlined,
} from '@ant-design/icons/lib/icons/';

const { Option } = Select;

export default function CenterCost() {
  const [isOpenModal, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [centerCostId, setCenterCostId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<any>('');

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
  }

  async function handleClose() {
    setIsModalOpen(false);
    setCenterCostId('');
    setName('');
    setCode('');
  }

  class SearchTable extends React.Component {
    state = {
      searchText: '',
      searchedColumn: '',
    };
    searchInput: Input;
    getColumnSearchProps = (dataIndex) => ({
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={(node) => {
              this.searchInput = node;
            }}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              this.handleSearch(selectedKeys, confirm, dataIndex)
            }
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() =>
                this.handleSearch(selectedKeys, confirm, dataIndex)
              }
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Buscar
            </Button>
            <Button
              onClick={() => this.handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Limpar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) =>
        record[dataIndex]
          ? record[dataIndex]
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase())
          : '',
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => this.searchInput.select(), 100);
        }
      },
      render: (text) =>
        this.state.searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[this.state.searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        ),
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      this.setState({
        searchText: selectedKeys[0],
        searchedColumn: dataIndex,
      });
    };

    handleReset = (clearFilters) => {
      clearFilters();
      this.setState({ searchText: '' });
    };

    render() {
      const columns = [
        {
          title: 'Nome da Conta',
          dataIndex: 'name',
          key: 'name',
          width: '20%',
          ...this.getColumnSearchProps('name'),
          sorter: (a, b) => a.name.length - b.name.length,
        },
        {
          title: 'Limite por compra',
          dataIndex: 'purchase_limit',
          key: 'purchase_limit',
          width: '20%',
          ...this.getColumnSearchProps('purchase_limit'),
          sorter: (a, b) => a.purchase_limit.length - b.purchase_limit.length,
        },
        {
          title: 'Meta Financeira',
          dataIndex: 'finance_goal',
          key: 'finance_goal',
          width: '20%',
          ...this.getColumnSearchProps('finance_goal'),
          sorter: (a, b) => a.finance_goal.length - b.finance_goal.length,
        },
        {
          title: 'Limite da meta (%)',
          dataIndex: 'purchase_limit',
          key: 'purchase_limit',
          width: '20%',
          ...this.getColumnSearchProps('purchase_limit'),
          sorter: (a, b) => a.purchase_limit.length - b.purchase_limit.length,
        },
        {
          title: 'Criado Em',
          dataIndex: 'created_at',
          key: 'created_at',
          width: '40%',
          ...this.getColumnSearchProps('created_at'),
          sorter: (a, b) => a.created_at.length - b.created_at.length,
        },
        {
          title: 'Operação',
          key: 'operation',
          render: (record) => {
            return (
              <>
                <EditFilled
                  style={{ cursor: 'pointer', fontSize: '16px' }}
                  onClick={() => handleEdit(record.id)}
                />
                <Popconfirm
                  title="Confirmar remoção?"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <a href="#" style={{ marginLeft: 20 }}>
                    <DeleteOutlined
                      style={{ color: '#ff0000', fontSize: '16px' }}
                    />
                  </a>
                </Popconfirm>
              </>
            );
          },
        },
      ];
      return <Table columns={columns} dataSource={['']} />;
    }
  }

  return (
    <>
      <Layout>
        <Row justify="end">
          <Col>
            <Button
              size={'large'}
              className={styles.button}
              icon={<PlusOutlined style={{ fontSize: '16px' }} />}
              onClick={() => setIsModalOpen(true)}
            >
              Cadastrar Conta
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>
      <Modal
        title="Cadastro Centro de custo"
        width={500}
        visible={isOpenModal}
        onCancel={() => {
          handleClose();
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              handleClose();
            }}
            type="default"
          >
            Cancelar
          </Button>,
          <Button
            key="submit"
            loading={loading}
            type="primary"
            onClick={handleRegister}
          >
            Salvar
          </Button>,
        ]}
      >
        <Row gutter={5} align={'middle'}>
          <Col span={20}>
            <Form.Item
              key="nameFormItem"
              labelCol={{ span: 20 }}
              label="Nome do centro de custo:"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Input
                key="nameKey"
                size="large"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={20}>
            <Form.Item
              key="codeFormItem"
              labelCol={{ span: 20 }}
              label="Código do centro de custo:"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Input
                type="number"
                key="codeKey"
                size="large"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Modal>
    </>
  );
}
