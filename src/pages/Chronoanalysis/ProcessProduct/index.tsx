import {
  DeleteOutlined,
  EditFilled,
  PlusOutlined,
  SearchOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  FormOutlined
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

const { Option } = Select;


interface IProcessProduct {
  id: string;
  name: string;
}
interface IProcessSubProduct {
  id: string;
  name: string;
}

interface IProduct {
  id: string;
  name: string;
}

interface IProps {
  processSubProduct: IProcessSubProduct[];
  processProduct: IProcessProduct[];
  product: IProduct[],
  notFound: boolean;
}


export default function ProcessProduct({ processSubProduct, product, processProduct }: IProps) {
  const [processSubProducts, setProcessSubProducts] = useState<IProcessSubProduct[]>(processSubProduct);
  const [processProducts, setProcessProducts] = useState<IProcessProduct[]>(processProduct);
  const [products, setProducts] = useState<IProduct[]>(product);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [subProductsAdded, setSubProductsAdded] = useState([
    {
      id: '',
      name: '',
      quantity: 0,
      isEditable: true,
      showSaveAndCancelButton: false,
      toCreateOnModalEdit: false,
      process_product_id: '',
      process_sub_product_id: '',
      process_sub_product_quantity: 0,
    }]);
  const [auxSubProductsAdded, setAuxSubProductsAdded] = useState([
    {
      id: '',
      name: '',
      quantity: 0,
      isEditable: true,
      showSaveAndCancelButton: false,
      toCreateOnModalEdit: false,
      process_product_id: '',
      process_sub_product_id: '',
      process_sub_product_quantity: 0,
    }])
  const [previewImage, setPreviewImage] = useState<string>();
  const [previewVisible, setPreviewVisible] = useState<boolean>();
  const [previewTitle, setPreviewTitle] = useState();
  const [imageIsDefined, setImageIsDefined] = useState<boolean>();
  const fileList = useRef<any>();
  const [image, setImage] = useState();
  const [processProductName, setProcessProductName] = useState<string>('');
  const [isEdit, setIsEdit] = useState<boolean>(false);

  // useEffect(() => {
  //   if (image) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setPreviewImage(reader.result as string);
  //     }
  //     reader.readAsDataURL(image);
  //   } else {
  //     setPreviewImage(null);
  //   }

  // }, [image]);

  // const uploadButton = (
  //   <div>
  //     <div style={styles}>
  //       <label className={styles.custom_file_upload}>
  //         <p><b>UPLOAD +</b></p>
  //         <input type="file" accept="image/*" ref={fileList} onChange={() => {
  //           setImage(fileList.current.files[0])
  //           setImageIsDefined(true)
  //         }} />
  //       </label>
  //     </div>

  //   </div>
  // );

  // const imageUploadSucces = (
  //   <div>
  //     <div style={styles}>

  //       <Title level={5} style={{ color: 'green' }}>Imagem Carregada</Title>
  //       <Button shape="circle" style={{ color: 'black' }} onClick={() => {

  //         handlePreview(image)

  //       }}>
  //         <EyeOutlined />
  //       </Button>
  //       <Button shape="circle" style={{ color: 'red', marginLeft: 5, }} onClick={() => {
  //         setImage(null)
  //         setImageIsDefined(false)
  //       }}>
  //         <CloseOutlined />
  //       </Button>
  //     </div>

  //   </div>
  // );

  function handleClose() {
    setId('');
    setProductId('');
    setProcessProductName('');
    setPreviewImage(null);
    setImage(null);
    setImageIsDefined(false);
    setIsModalOpen(false);
    setIsEdit(false);
    setSubProductsAdded([{
      id: '',
      name: '',
      quantity: 0,
      isEditable: true,
      showSaveAndCancelButton: false,
      toCreateOnModalEdit: false,
      process_product_id: '',
      process_sub_product_id: '',
      process_sub_product_quantity: 0,
    }])
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


        const filterProcessProduct = products.filter((iten) => {
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
        if (processProductName === '' || productId === '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Não foi possível cadastrar o Produto de Processo',
          });
        }

        const data = {
          product_id: productId,
          name: processProductName,
        };

        console.log(data);

        setLoading(true);
        const response = await api.post(`/chronoanalysis/process-product`, data);

        await api.post(`/chronoanalysis/product-process-sub-product`, {
          process_product_id: response.data.id,
          process_sub_product: subProductsAdded

        });

        console.log('Foi 0');
        const dataForm = new FormData();
        dataForm.append('image', image);
        console.log(dataForm);

        // const responseImage = await api.post(`/product/image/${response.data.id}`, dataForm, {
        //   headers: {
        //     "Content-Type": `multipart/form-data`,
        //   },
        // });

        processProduct.push(response.data);

        setProcessProducts(processProduct);
        setLoading(false);

        const newProcessProductRegistered = response.data;

        processSubProduct.push(newProcessProductRegistered);
        handleClose();

        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Item Editado Com Sucesso',
        });


      } catch (error) {
        console.error(error.response.data.message);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível Editar o Item',
        });
        setLoading(false);
      }
    }

    setId('');
  }

  async function handleDelete(id: string) {

    try {
      await api.delete(`/chronoanalysis/process-product/${id}`);

      const filterprocessProducts = processProducts.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setProcessProducts(filterprocessProducts);
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Produto de Processo Deletado com sucesso',
      });
    } catch (error) {
      console.error(error.response.data.message);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Deletar o Produto de Processo',
      });
    }
  }

  function addNewSubProduct(e) {
    e.preventDefault();

    const newArray = [
      ...subProductsAdded,
      {
        id: '',
        name: '',
        quantity: 0,
        isEditable: true,
        showSaveAndCancelButton: isEdit ? true : false,
        toCreateOnModalEdit: isEdit ? true : false,
        process_product_id: '',
        process_sub_product_id: '',
        process_sub_product_quantity: 0,
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

    if (Number(value) < 0) {
      return;
    }

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

  async function handleFilterSubProductProcessById(data) {

    const responseResult = await api.get(`/chronoanalysis/product-process-sub-product/${data.id}`);

    responseResult.data.map(item => {

      return Object.assign(item, {
        name: item.process_sub_product.name,
        isEditable: false,
        showSaveAndCancelButton: false,
        toCreateOnModalEdit: false,
        process_product_id: item.process_product.id,
        process_sub_product_id: item.process_sub_product.id,
        process_sub_product_quantity: item.quantity,
      })
    })

    setSubProductsAdded(responseResult.data);
    setProductId(data.product_id);
    setId(data.id);
    setProcessProductName(data.name);
    setIsEdit(true);
    setIsModalOpen(true);

  }
  function handleClickEditItemOfArrayOnEdition(index) {
    let newArray = [...subProductsAdded];
    let arrayForEdition = [...auxSubProductsAdded];

    newArray[index].showSaveAndCancelButton = true;
    newArray[index].isEditable = true;
    arrayForEdition[0].id = newArray[index].id;
    arrayForEdition[0].id = newArray[index].id;
    arrayForEdition[0].name = newArray[index].name;
    arrayForEdition[0].quantity = newArray[index].quantity;
    arrayForEdition[0].isEditable = newArray[index].isEditable;

    setAuxSubProductsAdded(arrayForEdition);
    setSubProductsAdded(newArray);
  }

  function cancelItemEdition(index) {
    let newArray = [...subProductsAdded];
    let arrayOfLatestValueOnSpecificIndex = [...auxSubProductsAdded];

    if (isEdit) {
      removeSubProducts(index);
      return
    }

    newArray[index].id = arrayOfLatestValueOnSpecificIndex[0].id;
    newArray[index].name = arrayOfLatestValueOnSpecificIndex[0].name;
    newArray[index].quantity = arrayOfLatestValueOnSpecificIndex[0].quantity;
    newArray[index].isEditable = arrayOfLatestValueOnSpecificIndex[0].isEditable;
    newArray[index].isEditable = false;
    newArray[index].showSaveAndCancelButton = false;

    setSubProductsAdded(newArray);
  }

  async function saveEditedItemOfArrayOnEdition(index) {
    let newArray = [...subProductsAdded];

    if (
      newArray[index].id === '' ||
      newArray[index].quantity === 0
    ) {
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não podem existir itens vazios',
      });
      return;
    }

    if (newArray[index].toCreateOnModalEdit) {
      try {
        const response = await api.post(`/chronoanalysis/product-process-sub-product/`, {
          process_product_id: id,
          process_sub_product: [{
            id: newArray[index].id,
            quantity: newArray[index].quantity
          }]
        });
        newArray[index].isEditable = false;
        newArray[index].showSaveAndCancelButton = false;
        newArray[index].toCreateOnModalEdit = false;
        newArray[index].id = response.data.id;
        setSubProductsAdded(newArray);
        Notification({
          type: 'success',
          title: 'Sucesso',
          description: 'Item Cadastrado com sucesso',
        });
        return;
      } catch (error) {
        console.error(error.response.data);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível Cadastrar o Item',
        });
      }

      return;
    }


    try {

      const data = {
        process_product_id: newArray[index].process_product_id,
        process_sub_product_id: newArray[index].process_sub_product_id,
        process_sub_product_quantity: newArray[index].process_sub_product_quantity,
      }
      const response = await api.put(`chronoanalysis/product-process-sub-product/${newArray[index].id}`, data);
      newArray[index].isEditable = false;
      newArray[index].showSaveAndCancelButton = false;
      setSubProductsAdded(newArray);
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Item Cadastrado com sucesso',
      });
    } catch (error) {
      console.error(error.response.data);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Cadastrar o Item',
      });
    }
  }

  async function handleDeleteItemOfArrayOnEdition(index) {
    const newArray = [...subProductsAdded];

    try {
      const response = await api.delete(`/chronoanalysis/product-process-sub-product/${newArray[index].id}`);
      removeSubProducts(index);
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Item Deletado com sucesso',
      });
    } catch (error) {
      console.error(error.response.data.message);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Deletar o Item',
      });
    }


  }
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
                  onClick={() => handleFilterSubProductProcessById(record)}
                />
                <Popconfirm
                  title="Confirmar remoção?"
                  onConfirm={() => { handleDelete(record.id) }}
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
          <Table columns={columns} dataSource={processProducts} />
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
        width={1000}
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
          <Col span={22}>
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
          <Col span={22}>
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
                {products.map((item) => (
                  <>
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  </>
                ))}
              </Select>
            </Form.Item>
            {/* <p>Selecione uma foto do Produto</p>
            {imageIsDefined != true && uploadButton}
            {imageIsDefined === true && imageUploadSucces} */}
          </Col>
        </Row>
        <Divider />

        {subProductsAdded.map((selectedIten, index) => (
          <Row gutter={10}>
            <Col span={14}>
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
                  disabled={!selectedIten.isEditable}
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
            <Col span={3}>
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
                  disabled={!selectedIten.isEditable}
                  value={selectedIten.quantity}
                  style={{ marginRight: '5%' }}
                  onChange={(e) => handleChangeQuantity(index, e.target.value)}
                />
                {/* {subProductsAdded.length != 1 && (
                  <MinusCircleOutlined
                    style={{ color: 'red' }}
                    onClick={() => removeSubProducts(index)}
                  />

                )} */}

              </Form.Item>
            </Col>
            {(isEdit && selectedIten.showSaveAndCancelButton === false) &&
              <Col>
                <Button
                  style={{ marginTop: 35, color: 'blue', borderColor: 'blue' }}
                  onClick={() => handleClickEditItemOfArrayOnEdition(index)}
                >
                  <FormOutlined />
                </Button>
              </Col>
            }


            {(subProductsAdded.length != 1 && selectedIten.showSaveAndCancelButton === false && !isEdit) && (
              <Col>
                <Popconfirm
                  title="Confirmar remoção?"
                  onConfirm={() => {
                    removeSubProducts(index)
                  }}
                >
                  <Button danger style={{ marginTop: 35 }}><DeleteOutlined /></Button>
                </Popconfirm>
              </Col>
            )}


            {(selectedIten.showSaveAndCancelButton === false && isEdit) && (
              <Col>
                <Popconfirm
                  title="Confirmar remoção?"
                  onConfirm={() => {
                    handleDeleteItemOfArrayOnEdition(index)
                  }}
                >
                  <Button danger style={{ marginTop: 35 }}><DeleteOutlined /></Button>
                </Popconfirm>
              </Col>
            )}


            {(selectedIten.showSaveAndCancelButton && selectedIten.isEditable) &&
              (
                <Col>
                  <Button
                    key="primary"
                    title="Salvar"
                    style={{
                      marginTop: 35,
                      color: 'white',
                      backgroundColor: 'rgb(5, 155, 50)',
                    }}
                    onClick={() => saveEditedItemOfArrayOnEdition(index)}
                  >
                    <SaveOutlined />
                    Salvar
                  </Button>
                </Col>
              )}


            {(selectedIten.showSaveAndCancelButton && selectedIten.isEditable) &&
              (
                <Col>
                  <Button
                    danger
                    style={{
                      marginTop: 35,
                      color: 'white',
                      backgroundColor: 'rgb(248, 75, 78)'
                    }}
                    onClick={() => cancelItemEdition(index)}
                  >
                    <DeleteOutlined />
                    Cancelar
                  </Button>
                </Col>
              )}

            {subProductsAdded.length - 1 === index && (
              <Button
                key="primary"
                title="Novo Sub Produto"
                style={{

                  width: '100%',
                  color: 'white',
                  backgroundColor: 'rgb(5, 155, 50)',
                }}
                onClick={(e) => {

                  addNewSubProduct(e)
                }}
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
    const processProduct = await apiClient.get('/chronoanalysis/process-product/')

    return {
      props: {
        processSubProduct: data,
        product: product.data,
        processProduct: processProduct.data
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
