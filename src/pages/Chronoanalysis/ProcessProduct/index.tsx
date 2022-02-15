import {
  DeleteOutlined,
  EditFilled,
  PlusOutlined,
  SearchOutlined,
  MinusCircleOutlined,
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
import SubProductProcess from '../SubProductProcess';
import { Divider } from 'antd';

const { Option } = Select;

interface IProcessSubProduct {
  id: string;
  name: string;
  created_at: Date;
}

interface IProduct {
  id: string;
  name: string;
}

interface IProps {
  processSubProduct: IProcessSubProduct[];
  product: IProduct[],
  notFound: boolean;
}

export default function ProcessProduct({ processSubProduct, product }: IProps) {
  const [processSubProducts, setProcessSubProducts] = useState(processSubProduct);
  const [products, setProducts] = useState(product);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [subProductsAdded, setSubProductsAdded] = useState([{ id: '', name: '', quantity: 0 }])

  function handleClose() {
    setName('');
    setId('');
    setIsModalOpen(false);
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (id) {
      try {
        if (name === '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Não foi possível editar o Produto de Processo',
          });
        }
        const data = {
          id: id,
          name: name,
        };
        setLoading(true);
        const response = await api.put(`/chronoanalysis/process-product/${id}`, data);

        const filterProcessProduct = product.filter((iten) => {
          if (iten.id == id) {
            return iten;
          }
        });

        filterProcessProduct.push(response.data);

        setProducts(products);
        setLoading(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Produto de Processo Editado com sucesso',
        });
      } catch (error) {
        console.error(error);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível Editar o Produto de Processo',
        });
        setLoading(false);
      }
    } else {
      try {
        if (name === '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Não foi possível cadastrar o Produto de Processo',
          });
        }

        const data = {
          name: name,
        };

        setLoading(true);
        const response = await api.post('/chronoanalysis/process-product', data);
        setLoading(false);

        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Produto de Processo Cadastrado com sucesso',
        });

        const newProcessProductRegistered = response.data;

        processSubProduct.push(newProcessProductRegistered);
        setIsModalOpen(false);
      } catch (error) {
        console.error(error);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível cadastrar a Produto de Processo',
        });
        setLoading(false);
      }
    }
    setName('');
    setId('');
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/chronoanalysis/process-product/${id}`);

      const filterprocessSubProducts = processSubProducts.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setProcessSubProducts(filterprocessSubProducts);
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Produto de Processo Deletado com sucesso',
      });
    } catch (error) {
      console.error(error);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Deletar o Produto de Processo',
      });
    }
  }

  function handleEdit(data: IProcessSubProduct) {
    setIsModalOpen(true);
    console.log(data);

    setId(data.id);
    setName(data.name);
  }

  function addNewSubProduct(e) {
    e.preventDefault();

    const newArray = [
      ...subProductsAdded,
      {
        id: '',
        name: '',
        quantity: 0,
      },
    ];

    setSubProductsAdded(newArray);
  }

  function removeSubProducts(indexOfItem: number) {

    let newArray = [...subProductsAdded];
    newArray.splice(indexOfItem, 1);
    setSubProductsAdded(newArray);
  }

  function handleChangeSubProduct(index, id) {
    let newArray = [...subProductsAdded];
    const values = processSubProducts.find(
      (test) => test.id === id
    );
    newArray[index].id = values.id;
    newArray[index].name = values.name;

    setSubProductsAdded(newArray);

  }

  function handleChangeQuantity(index, value) {
    let newArray = [...subProductsAdded];

    newArray[index].quantity = Number(value);

    console.log(newArray);

    setSubProductsAdded(newArray);
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
          title: 'Nome',
          dataIndex: 'name',
          key: 'name',
          width: '40%',
          ...this.getColumnSearchProps('name'),
          sorter: (a, b) => a.name.length - b.name.length,
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
          key: 'aaa',
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
      return (
        <>
          <Table columns={columns} dataSource={products} />
        </>
      );
    }
  }


  return (
    <div>
      <Layout>
        <Row justify="end">
          <Col>
            <Button
              size={'large'}
              className={styles.button}
              icon={<PlusOutlined style={{ fontSize: '16px' }} />}
              onClick={() => setIsModalOpen(true)}
            >
              Cadastrar Produto de Processo
            </Button>
          </Col>
        </Row>

        <SearchTable />
      </Layout>
      <Modal
        title="Cadastro de Produto de Processo"
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
        <Row>
          <Col span={20}>
            <Form.Item
              key="productFormItem"
              labelCol={{ span: 23 }}
              label="Produto:"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Select
                key="managerName"
                size="large"

                onChange={(e) => {
                  setId(e.toString());

                }}
              >
                {product.map((item) => (
                  <>
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  </>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Divider />

        {subProductsAdded.map((selectedIten, index) => (
          <Row gutter={10}>
            <Col span={12}>
              <Form.Item
                key="subProductFormItem"
                labelCol={{ span: 23 }}
                label="Sub-Produto:"
                labelAlign={'left'}
                style={{
                  backgroundColor: 'white',
                }}
                required
              >
                <Select
                  key="subProductName"
                  size="large"
                  value={selectedIten.name}
                  onChange={(e) => {
                    handleChangeSubProduct(index, e)
                  }}
                >
                  {processSubProduct.map((item) => (
                    <>
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    </>
                  ))}
                </Select>
              </Form.Item>

            </Col>

            <Col span={6}>
              <Form.Item
                key="removeFormItem"
                label="Qtd: "
                labelAlign={'left'}
                style={{
                  backgroundColor: 'white',
                }}
                required
              >
                <Input
                  type="number"
                  key="totalKey"
                  size="large"
                  placeholder="0"
                  value={selectedIten.quantity}
                  style={{ width: '80%', marginRight: '5%' }}
                  onChange={(e) => handleChangeQuantity(index, e.target.value)}
                />
                {subProductsAdded.length != 1 && (
                  <MinusCircleOutlined
                    style={{ color: 'red' }}
                    onClick={() => removeSubProducts(index)}
                  />

                )}

              </Form.Item>
            </Col>

            {subProductsAdded.length - 1 === index && (
              <Button
                key="primary"
                title="Novo Sub-Produto"
                style={{

                  width: '100%',
                  color: 'white',
                  backgroundColor: 'rgb(5, 155, 50)',
                }}
                onClick={addNewSubProduct}
              >
                <PlusOutlined />
                Novo Sub-Produto
              </Button>
            )}
          </Row>
        ))}



      </Modal>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const { data } = await apiClient.get('/chronoanalysis/process-product');
    const product = await apiClient.get('/chronoanalysis/process-product');

    return {
      props: {
        processSubProduct: data,
        product: product,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        processSubProduct: [],
        product: []
      },
    };
  }
};
