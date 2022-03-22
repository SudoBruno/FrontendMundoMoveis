import {
  DeleteOutlined,
  EditFilled,
  PlusOutlined,
  SearchOutlined,
  MinusCircleOutlined,
  EyeOutlined,
  CloseOutlined
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
  Upload,
} from 'antd';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import styles from '../../../styles/app.module.scss';
import { Typography } from 'antd';

const { Title } = Typography;

import { Notification } from '../../../components/Notification';
import { api } from '../../../services/api';
import { GetServerSideProps } from 'next';
import { getAPIClient } from '../../../services/axios';

import { Divider } from 'antd';
import FormData from 'form-data'



import getBase64 from './utils/index';
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
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [subProductsAdded, setSubProductsAdded] = useState([{ process_sub_product_id: '', name: '', quantity: 0 }])
  const [previewImage, setPreviewImage] = useState<string>();
  const [previewVisible, setPreviewVisible] = useState<boolean>();
  const [previewTitle, setPreviewTitle] = useState();
  const [imageIsDefined, setImageIsDefined] = useState<boolean>();
  const fileList = useRef<any>();
  const [image, setImage] = useState();
  const [processProductName, setProcessProductName] = useState<string>('');

  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      }
      reader.readAsDataURL(image);
    } else {
      setPreviewImage(null);
    }

  }, [image]);

  const uploadButton = (
    <div>
      <div style={styles}>
        <label className={styles.custom_file_upload}>
          <p><b>UPLOAD +</b></p>
          <input type="file" accept="image/*" ref={fileList} onChange={() => {
            setImage(fileList.current.files[0])
            setImageIsDefined(true)
          }} />
        </label>
      </div>

    </div>
  );

  const imageUploadSucces = (
    <div>
      <div style={styles}>

        <Title level={5} style={{ color: 'green' }}>Imagem Carregada</Title>
        <Button shape="circle" style={{ color: 'black' }} onClick={() => {

          handlePreview(image)

        }}>
          <EyeOutlined />
        </Button>
        <Button shape="circle" style={{ color: 'red', marginLeft: 5, }} onClick={() => {
          setImage(null)
          setImageIsDefined(false)
        }}>
          <CloseOutlined />
        </Button>
      </div>

    </div>
  );
  function handleClose() {
    console.log('close');

    setId('');
    setProductId('');
    setPreviewImage(null);
    setImage(null);
    setImageIsDefined(false);
    setIsModalOpen(false);
    setSubProductsAdded([{ process_sub_product_id: '', name: '', quantity: 0 }])
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (id) {
      try {
        if (false) {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Não foi possível editar o Produto de Processo',
          });
        }
        const data = {
          product_id: productId,
          process_sub_product: subProductsAdded
        };
        setLoading(true);
        const response = await api.put(`/chronoanalysis/product-process-sub-product`, data);
        console.log('AAAAAAA: ', response.data);


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
        if (false) {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Não foi possível cadastrar o Produto de Processo',
          });
        }

        const data = {
          product_id: productId,
          process_sub_product: subProductsAdded
        };
        setLoading(true);
        const response = await api.post(`/chronoanalysis/product-process-sub-product`, data);
        console.log('AAAAAAA: ', response.data);

        const dataForm = new FormData();
        dataForm.append('image', image);


        const responseImage = await api.post(`/product/image/${response.data.id}`, dataForm, {
          headers: {
            "Content-Type": `multipart/form-data`,
          },
        });

        console.log('bbbbb: ', responseImage.data);


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
          description: 'Produto de Processo Cadastrado com sucesso',
        });

        const newProcessProductRegistered = response.data;

        processSubProduct.push(newProcessProductRegistered);
        setIsModalOpen(false);
      } catch (error) {
        console.log(error);
        console.error(error);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível cadastrar a Produto de Processo',
        });
        setLoading(false);
      }
    }

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

  function handleEdit(data) {
    setIsModalOpen(true);
    console.log(data);

    setId(data.id);

  }

  function addNewSubProduct(e) {
    e.preventDefault();

    const newArray = [
      ...subProductsAdded,
      {
        process_sub_product_id: '',
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
    newArray[index].process_sub_product_id = values.id;
    newArray[index].name = values.name;

    setSubProductsAdded(newArray);

  }

  function handleChangeQuantity(index, value) {
    let newArray = [...subProductsAdded];

    newArray[index].quantity = Number(value);

    console.log(newArray);

    setSubProductsAdded(newArray);
  }


  async function handlePreview(file) {
    if (file && file.type.substring(0, 5) === "image") {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setPreviewImage(reader.result as string);
    } else {
      setPreviewImage(null);
    }

    setPreviewVisible(true);
    setPreviewTitle(file.name)
  };

  function handleCancel() {
    setPreviewVisible(false)
  };

  class SearchTable extends React.Component {
    state = {
      searchText: '',
      searchedColumn: '',
    };
    searchInput;
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
        key="previewImageModal"
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
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
              key="productFormName"
              labelCol={{ span: 23 }}
              label="Nome do Produto de Processo:"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Input
                key="totalKey"
                size="large"
                value={processProductName}
                style={{ width: '80%', marginRight: '5%' }}
                onChange={(e) => setProcessProductName(e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>
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
                value={productId}
                onChange={(e) => {
                  setProductId(e.toString());
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
            <p>Selecione uma foto do Produto</p>
            {imageIsDefined != true && uploadButton}
            {imageIsDefined === true && imageUploadSucces}
          </Col>
        </Row>
        <Divider />

        {subProductsAdded.map((selectedIten, index) => (
          <Row gutter={10}>
            <Col span={12}>
              <Form.Item
                key="subProductFormItem"
                labelCol={{ span: 23 }}
                label="Sub Produto:"
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
            <Col span={12}>
              <Form.Item
                key="subProductFormItem"
                labelCol={{ span: 23 }}
                label="Sub Linha:"
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
                title="Novo Sub Produto"
                style={{

                  width: '100%',
                  color: 'white',
                  backgroundColor: 'rgb(5, 155, 50)',
                }}
                onClick={addNewSubProduct}
              >
                <PlusOutlined />
                Novo Sub Produto
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
    const { data } = await apiClient.get('/chronoanalysis/process-sub-product');
    const product = await apiClient.get('/product/product-mirror');
    console.log(data);


    return {
      props: {
        processSubProduct: data,
        product: product.data,
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
