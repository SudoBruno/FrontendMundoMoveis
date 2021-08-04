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
  email: string;
  phone: string;
  state: string;
  address: string;
  street: string;
  posta_code: string;
}

interface IProp {
  tenant: ITenant[];
}

export default function Tenant({ tenant }: IProp) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState(tenant);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [state, setState] = useState('');
  const [street, setStreet] = useState('');

  function handleClose() {
    setId('');
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setPostalCode('');
    setState('');
    setStreet('');

    setIsModalOpen(false);
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (id) {
      try {
        if (
          name === '' ||
          email === '' ||
          phone === '' ||
          state === '' ||
          address === '' ||
          city === '' ||
          postalCode === '' ||
          street === ''
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
          phone: phone,
          state: state,
          address: address,
          city: city,
          postal_code: postalCode,
          street: street,
        };

        setLoading(true);
        await api.put(`/Tenant/${id}`, data);
        setLoading(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Inquilino Editado com sucesso',
        });
      } catch (error) {
        setLoading(false);
        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível editar o Inquilino',
        });
      }
    } else {
      try {
        if (
          name === '' ||
          email === '' ||
          phone === '' ||
          state === '' ||
          address === '' ||
          city === '' ||
          postalCode === '' ||
          street === ''
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
          phone: phone,
          state: state,
          address: address,
          city: city,
          postal_code: postalCode,
          street: street,
        };
        setLoading(true);
        const response = await api.post(`/tenant`, data);
        setLoading(false);

        const newTenantRegistered = response.data;

        tenants.push(newTenantRegistered);
        setIsModalOpen(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Inquilino Criado com sucesso',
        });
      } catch (error) {
        console.error(error);
        setLoading(false);
        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível cadastrar o Inquilino',
        });
      }
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/warehouse/supplier/${id}`);

      const filterTenants = tenants.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setTenants(filterTenants);
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Inquilino Deletado com sucesso',
      });
    } catch (error) {
      console.error(error);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Deletar o Inquilino',
      });
    }
  }

  async function handleEdit(data: ITenant) {
    setName(data.name);
    setId(data.id);
    setPhone(data.phone);
    setEmail(data.email);

    setIsModalOpen(true);
  }

  async function getAPiDataFromCorreios() {
    const response = fetch(`https://viacep.com.br/ws/${postalCode}/json/`)
      .then((res) => res.json())
      .then(
        (result) => {
          if (result.erro === true) {
            Notification({
              type: 'error',
              title: 'Não Encontramos Dados',
              description: 'Tente outro CEP, ou insira manualmente',
            });
            return;
          }
          setCity(result.localidade);
          setAddress(result.bairro);
          setStreet(result.logradouro);
          setState(result.uf);
        },
        (error) => {
          Notification({
            type: 'error',
            title: 'Não Encontramos Dados',
            description: 'Tente outro CEP, ou insira manualmente',
          });
          return;
        }
      );
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
      return <Table columns={columns} dataSource={tenants} />;
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
              Cadastrar Inquilino
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>

      <Modal
        title="Cadastro de Inquilinos"
        width={1000}
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
        <Row gutter={10}>
          <Col span={9}>
            <Form.Item
              key="nameFormItem"
              labelCol={{ span: 23 }}
              label="Nome:"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
                fontWeight: 'bold',
              }}
              required
            >
              <Input
                key="supplierName"
                size="large"
                placeholder="Nome do Inquilino, ex: MUNDO MÓVEIS"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={9}>
            <Form.Item
              key="email"
              labelCol={{ span: 23 }}
              label="Email:"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Input
                key="supplierEmail"
                size="large"
                placeholder="Digite o Email do Inquilino"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              labelCol={{ span: 23 }}
              label="Telefone:"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <MaskedInput
                mask="(11) 1 1111-1111"
                name="card"
                key="tenantPhone"
                size="large"
                placeholder="Ex: (18) 99643-7333"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={5}>
            <Form.Item
              key="cepFormItem"
              labelCol={{ span: 23 }}
              label="CEP:"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
                fontWeight: 'bold',
              }}
              required
            >
              <MaskedInput
                name="cepForm"
                mask="11111-111"
                key="supplierName"
                size="large"
                placeholder="Ex: 16013-120"
                value={postalCode}
                onChange={(e) => {
                  setPostalCode(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              key="buttonSearch"
              labelCol={{ span: 10 }}
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
                fontWeight: 'bold',
                marginTop: '2rem',
              }}
            >
              <Button
                size="large"
                type="primary"
                disabled={postalCode === '' ? true : false}
                icon={<SearchOutlined />}
                onClick={() => {
                  getAPiDataFromCorreios();
                }}
              >
                Buscar
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={2}>
            <Form.Item
              labelCol={{ span: 23 }}
              label="Estado:"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Input
                key="state"
                size="large"
                placeholder="SP"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              labelCol={{ span: 23 }}
              label="Cidade:"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Input
                key="tenantPhone"
                size="large"
                placeholder="Ex: (18) 99643-7333"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              labelCol={{ span: 23 }}
              label="Bairro:"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Input
                key="tenantPhone"
                size="large"
                placeholder="Ex: Alphaville"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              labelCol={{ span: 23 }}
              label="Rua e Número:"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Input
                key="street"
                size="large"
                placeholder="Ex: Santiago Troncoso, 231"
                value={street}
                onChange={(e) => {
                  setStreet(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
        </Row>
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
