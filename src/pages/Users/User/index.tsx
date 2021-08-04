import {
  DeleteOutlined,
  EditFilled,
  PlusOutlined,
  SearchOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
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
import MaskedInput from 'antd-mask-input';
import React, { FormEvent, useState } from 'react';
import Highlighter from 'react-highlight-words';
import styles from '../../../styles/app.module.scss';

import { Notification } from '../../../components/Notification';
import { api } from '../../../services/api';
import { GetServerSideProps } from 'next';
import { getAPIClient } from '../../../services/axios';

const { Option } = Select;

interface ITenant {
  id: string;
  name: string;
}

interface IProp {
  tenant: ITenant[];
}

export default function User({ tenant }: IProp) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState(tenant);
  const [users, setUsers] = useState([]);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState(
    '2d751a65-3920-46fe-8181-cd31b293ca43'
  );
  const [tenantName, setTenantName] = useState('');
  const [phone, setPhone] = useState('');
  const [accessLevel, setAccessLevel] = useState(0);

  function handleClose() {
    setId('');
    setName('');
    setEmail('');
    setPassword('');

    setIsModalOpen(false);
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (id) {
      try {
        if (
          name === '' ||
          email === '' ||
          password === '' ||
          phone === '' ||
          tenantId === '' ||
          accessLevel === 0
        ) {
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
          password: password,
        };
        setLoading(true);
        await api.put(`/user/${id}`, data);
        setLoading(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Usuário Editado com sucesso',
        });
      } catch (error) {
        setLoading(false);
        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível editar o Usuário',
        });
      }
    } else {
      try {
        if (
          name === '' ||
          email === '' ||
          password === '' ||
          phone === '' ||
          tenantId === '' ||
          accessLevel === 0
        ) {
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
          password: password,
          phone: phone,
          tenant_id: '2d751a65-3920-46fe-8181-cd31b293ca43',
          access_level: accessLevel,
        };

        setLoading(true);
        const response = await api.post(`/users`, data);
        setLoading(false);

        const newUserRegistered = response.data;

        users.push(newUserRegistered);
        setIsModalOpen(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Usuário Criado com sucesso',
        });
      } catch (error) {
        console.error(error);
        setLoading(false);
        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível cadastrar o Usuário',
        });
      }
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/user/${id}`);

      const filterUsers = users.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setUsers(filterUsers);
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Usuário Deletado com sucesso',
      });
    } catch (error) {
      console.error(error);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Deletar o Usuário',
      });
    }
  }

  // async function handleEdit(data: ISupplier) {
  //   setName(data.name);
  //   setId(data.id);
  //   setPassword(data.password);
  //  setEmail(data.email);
  //
  //   setIsModalOpen(true);
  // }

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
      return <Table columns={columns} dataSource={users} />;
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
              Cadastrar Usuário
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>

      <Modal
        title="Cadastro de Usuário"
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
            style={{ width: 400 }}
            placeholder="Digite o Nome do Usuário"
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
            style={{ width: 400 }}
            placeholder="Digite o Email do Usuário"
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
          {' '}
          <Input
            key="tenantPhone"
            size="large"
            placeholder="Ex: (18) 99643-7333"
            style={{ width: 250 }}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
            }}
          />
          {/* <MaskedInput
            mask="(11) 1 1111-1111"
            name="card"
            key="tenantPhone"
            size="large"
            placeholder="Ex: (18) 99643-7333"
            style={{ width: 250 }}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
            }}
          /> */}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 23 }}
          label="Inquilino:"
          labelAlign={'left'}
          style={{ backgroundColor: 'white', fontWeight: 'bold' }}
          required
        >
          <Select
            size="large"
            style={{ width: 400 }}
            value={tenantName}
            onChange={(e) => {
              setTenantId(e[0]);
              setTenantName(e[1]);
            }}
          >
            {tenants.map((item) => (
              <>
                <Option key={item.id} value={[item.id, item.name]}>
                  {item.name}
                </Option>
              </>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          labelCol={{ span: 23 }}
          label="Nivel de Acesso:"
          labelAlign={'left'}
          style={{ backgroundColor: 'white', fontWeight: 'bold' }}
          required
        >
          <Input
            size="large"
            style={{ width: 70 }}
            value={accessLevel}
            onChange={(e) => setAccessLevel(Number(e.target.value))}
          />
        </Form.Item>
        <Form.Item
          labelCol={{ span: 23 }}
          label="Senha:"
          labelAlign={'left'}
          style={{ backgroundColor: 'white', fontWeight: 'bold' }}
          required
        >
          <Input.Password
            size="large"
            style={{ width: 250 }}
            value={password}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
      </Modal>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const { data } = await apiClient.get('/tenant');

    return {
      props: {
        tenant: data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        tenant: [],
      },
    };
  }
};
