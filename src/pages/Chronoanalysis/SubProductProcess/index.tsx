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

import { Player } from "video-react";

import { Divider } from 'antd';
import FormData from 'form-data'

const { Option } = Select;

interface ISubLine {
  id: string;
  name: string;
}
interface ISubProduct {
  id: string;
  name: string;
  created_at: Date;
}
interface IProps {
  subProduct: ISubProduct[];
  subLine: ISubLine[];
  notFound: boolean;
}

export default function SubProductProcess({ subProduct, subLine }: IProps) {
  const [subProducts, setSubProducts] = useState(subProduct);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [subLines, setSubLines] = useState(subLine);
  const [subLineId, setSubLineId] = useState('');
  const [subLineName, setSubLineName] = useState('');
  const fileList = useRef<any>();
  const [videoIsDefined, setVideoIsDefined] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<any>()
  const [video, setVideo] = useState();
  const [previewVisible, setPreviewVisible] = useState<boolean>();
  const [previewTitle, setPreviewTitle] = useState();


  useEffect(() => {
    if (video) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewVideo(reader.result as string);
      }
      reader.readAsDataURL(video);
    } else {
      setPreviewVideo(null);
    }

  }, [video]);

  const uploadButton = (
    <div>
      <div style={styles}>
        <label className={styles.custom_file_upload}>
          <p><b>UPLOAD +</b></p>
          <input type="file" accept="video/*" ref={fileList} onChange={() => {
            setVideo(fileList.current.files[0])
            setVideoIsDefined(true)
          }} />
        </label>
      </div>

    </div>
  );

  const videoUploadSucces = (
    <div>
      <div style={styles}>

        <Title level={5} style={{ color: 'green' }}>Video Carregado</Title>
        <Button shape="circle" style={{ color: 'black' }} onClick={() => {
          handlePreview(video)
        }}>
          <EyeOutlined />
        </Button>
        <Button shape="circle" style={{ color: 'red', marginLeft: 5, }} onClick={() => {
          setVideo(null)
          setVideoIsDefined(false)
        }}>
          <CloseOutlined />
        </Button>
      </div>

    </div>
  );


  async function handlePreview(file) {
    if (file && file.type.substring(0, 5) === "video") {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setPreviewVideo(reader.result as string);
    } else {
      setPreviewVideo(null);
    }

    setPreviewVisible(true);
    setPreviewTitle(file.name)
  };

  function handleCancel() {
    setPreviewVisible(false)
  };

  function handleClose() {
    setName('');
    setId('');
    setIsModalOpen(false);
    setPreviewVideo(null);
    setVideo(null);
    setVideoIsDefined(false);
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
            description: 'Não foi possível editar o Sub-Produto',
          });
        }
        const data = {
          id: id,
          name: name,
        };
        setLoading(true);
        const response = await api.put(`/chronoanalysis/process-sub-product/${id}`, data);

        const filterSubProducts = subProduct.filter((iten) => {
          if (iten.id !== id) {
            return iten;
          }
        });
        filterSubProducts.push(response.data)

        setSubProducts(filterSubProducts)
        setLoading(false);
        setIsModalOpen(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Sub-Produto Editado com sucesso',
        });
      } catch (error) {
        console.error(error);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível Editar o Sub-Produto',
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
            description: 'Não foi possível cadastrar o Sub-Produto',
          });
        }

        const data = {
          name: name,
        };

        setLoading(true);
        const response = await api.post('/chronoanalysis/process-sub-product', data);
        setLoading(false);

        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Sub-Produto Cadastrado com sucesso',
        });

        const newSubProductRegistered = response.data;

        subProduct.push(newSubProductRegistered);
        setSubProducts(subProduct);
        setIsModalOpen(false);
      } catch (error) {
        console.error(error);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível cadastrar a Sub-Produto',
        });
        setLoading(false);
      }
    }
    setName('');
    setId('');
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/chronoanalysis/process-sub-product/${id}`);

      const filtersubProducts = subProducts.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setSubProducts(filtersubProducts);
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Sub-Produto Deletado com sucesso',
      });
    } catch (error) {
      console.error(error);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Deletar o Sub-Produto',
      });
    }
  }

  function handleEdit(data: ISubProduct) {
    console.log(data);

    setIsModalOpen(true);
    setId(data.id);
    setName(data.name);
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
          <Table columns={columns} dataSource={subProducts} />
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
              Cadastrar Sub-Produto
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>
      <Modal
        key="previewVideoModal"
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <video controls src={previewVideo} width="460em"></video>
      </Modal>
      <Modal
        title="Cadastro de Sub-Produto"
        visible={isModalOpen}
        onCancel={handleClose}
        width={600}
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
          <Row>
            <Col span={20}>
              <Input
                key="sub-productName"
                size="large"
                style={{ width: 400, marginBottom: '10px' }}
                placeholder="Nome do Sub-Produto"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </Col>
          </Row>

          <Row>
            <Col span={10}>
              <p>Selecione o Video do Produto</p>
              {videoIsDefined != true && uploadButton}
              {videoIsDefined === true && videoUploadSucces}
            </Col>
            <Col span={13}>
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
                  value={subLineId}
                  onChange={(e) => {
                    setSubLineId(e.toString());
                  }}
                >
                  {subLines.map((item) => (
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

        </Form.Item>
      </Modal>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const { data } = await apiClient.get('/chronoanalysis/process-sub-product');
    const subLine = await apiClient.get('/chronoanalysis/sub-production-line/');

    return {
      props: {
        subProduct: data,
        subLine: subLine.data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        subProduct: [],
        subLine: [],
      },
    };
  }
};
