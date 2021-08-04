import {
  DeleteOutlined,
  EditFilled,
  PlusOutlined,
  SearchOutlined,
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
import styles from '../../../../styles/app.module.scss';

import { Notification } from '../../../../components/Notification';
import { api } from '../../../../services/api';
import { GetServerSideProps } from 'next';
import { getAPIClient } from '../../../../services/axios';

const { Option } = Select;

interface ISupplier {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface IProp {
  supplier: ISupplier[];
}

export default function supplier({ supplier }: IProp) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState(supplier);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  function handleClose() {
    setId('');
    setName('');
    setEmail('');
    setPhone('');

    setIsModalOpen(false);
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (id) {
      try {
        if (name === '' || email === '' || phone === '' || id === '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Existem campos vazios',
          });
        }
        const data = {
          name: name,
          email: email,
          phone: phone,
        };
        setLoading(true);
        await api.put(`/warehouse/supllier/${id}`, data);
        setLoading(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Fornecedor Editado com sucesso',
        });
      } catch (error) {
        setLoading(false);
        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível editar o Fornecedor',
        });
      }
    } else {
      try {
        if (name === '' || email === '' || phone === '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Existem campos vazios',
          });
        }
        const data = {
          name: name,
          email: email,
          phone: phone,
        };
        setLoading(true);
        const response = await api.post(`/warehouse/supplier`, data);
        setLoading(false);

        const newSupplierRegistered = response.data;

        suppliers.push(newSupplierRegistered);
        setIsModalOpen(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Fornecedor Criado com sucesso',
        });
      } catch (error) {
        console.error(error);
        setLoading(false);
        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível cadastrar o Fornecedor',
        });
      }
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/warehouse/supplier/${id}`);

      const filterSuppliers = suppliers.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setSuppliers(filterSuppliers);
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Fornecedor Deletado com sucesso',
      });
    } catch (error) {
      console.error(error);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Deletar o fornecedor',
      });
    }
  }

  async function handleEdit(data: ISupplier) {
    setName(data.name);
    setId(data.id);
    setPhone(data.phone);
    setEmail(data.email);

    setIsModalOpen(true);
  }

  class SearchTable extends React.Component {
    state = {
      searchText: '',
      searchedColumn: '',
    };

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
          title: 'Nome',
          dataIndex: 'name',
          key: 'name',
          width: '30%',
          ...this.getColumnSearchProps('name'),
          sorter: (a, b) => a.name.length - b.name.length,
        },
        {
          title: 'Email',
          dataIndex: 'email',
          key: 'email',
          width: '30%',
          ...this.getColumnSearchProps('email'),
          sorter: (a, b) => a.email.length - b.email.length,
        },
        {
          title: 'Telefone',
          dataIndex: 'phone',
          key: 'phone',
          width: '20%',
          ...this.getColumnSearchProps('created_at'),
          sorter: (a, b) => a.phone.length - b.phone.length,
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
                  onClick={() => handleEdit(record)}
                />
                {/* onClick={() => handleEdit(record)} */}
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
      return <Table columns={columns} dataSource={suppliers} />;
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
              Cadastrar Fornecedor
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>

      <Modal
        title="Cadastro de Categoria"
        visible={isModalOpen}
        onCancel={handleClose}
        footer={[
          <Button key="back" onClick={handleClose} type="default">
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleRegister}
          >
            Salvar
          </Button>,
        ]}
      >
        <Form.Item
          labelCol={{ span: 23 }}
          label="Nome:"
          labelAlign={'left'}
          style={{ backgroundColor: 'white', fontWeight: 'bold' }}
          required
        >
          <Input
            key="supplierName"
            size="large"
            style={{ width: 400, marginBottom: '10px' }}
            placeholder="Digite o Nome do Fornecedor"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </Form.Item>
        <Form.Item
          labelCol={{ span: 23 }}
          label="Email:"
          labelAlign={'left'}
          style={{ backgroundColor: 'white', fontWeight: 'bold' }}
          required
        >
          <Input
            key="supplierEmail"
            size="large"
            style={{ width: 400, marginBottom: '10px' }}
            placeholder="Digite o Email do Fornecedor"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </Form.Item>
        <Form.Item
          labelCol={{ span: 23 }}
          label="Telefone:"
          labelAlign={'left'}
          style={{ backgroundColor: 'white', fontWeight: 'bold' }}
          required
        >
          <Input
            key="supplierPhone"
            size="large"
            style={{ width: 400, marginBottom: '10px' }}
            placeholder="Digite o Telefone do Fornecedor"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
            }}
          />
        </Form.Item>
      </Modal>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const { data } = await apiClient.get('/warehouse/supplier');

    return {
      props: {
        supplier: data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        supplier: [],
      },
    };
  }
};
