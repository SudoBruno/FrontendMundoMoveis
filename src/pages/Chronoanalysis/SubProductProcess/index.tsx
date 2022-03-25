import {
  DeleteOutlined,
  EditFilled,
  PlusOutlined,
  SearchOutlined,
  FormOutlined,
  EyeOutlined,
  CloseOutlined,
  SaveOutlined
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
  TimePicker
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
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
import moment from 'moment';


const { Option } = Select;
interface IWorkElement {
  id: string;
  name: string;
}
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
  workElement: IWorkElement[];
  notFound: boolean;
}

export default function SubProductProcess({ subProduct, subLine, workElement }: IProps) {
  const [subProducts, setSubProducts] = useState<ISubProduct[]>(subProduct);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subProductId, setSubProductId] = useState('');
  const [isEdit, setIsEdit] = useState(false);
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
  const [workElementsAdded, setWorkElementsAdded] = useState([{
    id: '',
    process_sub_product_id: '',
    work_element_id: '',
    work_element_name: '',
    sequential_order: 0,
    initial_time_video: '00:00:00',
    initial_time_video_to_show: moment('00:00:00', 'HH:mm:ss'),
    finish_time_video: '00:00:00',
    finish_time_video_to_show: moment('00:00:00', 'HH:mm:ss'),
    isEditable: true,
    showSaveAndCancelButton: false,
    toCreateOnModalEdit: false,
  }]);
  const [auxWorkElementsAdded, setAuxWorkElementsAdded] = useState([{
    id: '',
    process_sub_product_id: '',
    work_element_id: '',
    work_element_name: '',
    sequential_order: 0,
    initial_time_video: '00:00:00',
    initial_time_video_to_show: moment('00:00:00', 'HH:mm:ss'),
    finish_time_video: '00:00:00',
    finish_time_video_to_show: moment('00:00:00', 'HH:mm:ss'),
    isEditable: true,
    showSaveAndCancelButton: false,
    toCreateOnModalEdit: false,
  }]);
  const [workElements, setWorkElements] = useState<IWorkElement[]>(workElement);


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
    setSubProductId('');
    setIsModalOpen(false);
    setPreviewVideo(null);
    setVideo(null);
    setVideoIsDefined(false);
    setIsEdit(false);

    setWorkElementsAdded([{
      id: '',
      process_sub_product_id: '',
      work_element_id: '',
      work_element_name: '',
      sequential_order: 0,
      initial_time_video: '00:00:00',
      initial_time_video_to_show: moment('00:00:00', 'HH:mm:ss'),
      finish_time_video: '00:00:00',
      finish_time_video_to_show: moment('00:00:00', 'HH:mm:ss'),
      isEditable: true,
      showSaveAndCancelButton: false,
      toCreateOnModalEdit: false,
    }]);
  }

  async function handleRegister(e) {
    e.preventDefault();

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
        sub_production_line_id: subLineId,
      };

      setLoading(true);
      const response = await api.post('/chronoanalysis/process-sub-product', data);

      const dataForm = new FormData();
      dataForm.append('video', video);

      const responseVideo = await api.post(`/chronoanalysis/process-sub-product/${response.data.id}`, dataForm, {
        headers: {
          "Content-Type": `multipart/form-data`,
        },
      });

      workElementsAdded.map(async (item) => {
        return item.process_sub_product_id = response.data.id;
      })

      workElementsAdded.map(async (item) => {
        try {
          await api.post(`/chronoanalysis/process-sub-product-work-element/`, item);
        } catch (error) {
          console.log('CADASTRO: ', error.response.data.message);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Não foi possível cadastrar o item do Sub-Produto',
          });
        }
      })
      setLoading(false);

      const newSubProductRegistered = response.data;
      subProduct.push(newSubProductRegistered);
      setSubProducts(subProduct);
      setIsModalOpen(false);
      setName('');
      setSubProductId('');

      Notification({
        type: 'success',
        title: 'Enviado',
        description: 'Sub-Produto Cadastrado com sucesso',
      });


    } catch (error) {
      console.error(error.response.data.message);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível cadastrar a Sub-Produto',
      });
      setLoading(false);
    }


  }

  async function handleEdit() {
    try {
      if (name === '' || subLineId === '') {
        setLoading(false);
        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não podem existir campos vazios',
        });
      }
      const data = {
        name: name,
        sub_production_line_id: subLineId,
      };

      setLoading(true);
      const response = await api.put(`/chronoanalysis/process-sub-product/${subProductId}`, data);

      const filterSubProducts = subProduct.filter((iten) => {
        if (iten.id !== subProductId) {
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

  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/chronoanalysis/process-sub-product/${id} `);

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

  async function handleFilterSubProductProcessById(data) {

    const responseResult = await api.get(`/chronoanalysis/process-sub-product-work-element/${data.id}`);
    console.log(responseResult.data);

    responseResult.data.map(item => {
      return Object.assign(item, {
        isEditable: false,
        showSaveAndCancelButton: false,
        initial_time_video_to_show: moment(item.initial_time_video, 'HH:mm:ss'),
        finish_time_video_to_show: moment(item.finish_time_video, 'HH:mm:ss'),
        toCreateOnModalEdit: false,
      })
    })

    setWorkElementsAdded(responseResult.data);
    setIsEdit(!isEdit);
    setIsModalOpen(true);
    setSubProductId(data.id);
    setName(data.name);
  }

  function addNewSubProduct(e) {
    e.preventDefault();

    const newArray = [
      ...workElementsAdded,
      {
        id: '',
        process_sub_product_id: '',
        work_element_id: '',
        work_element_name: '',
        sequential_order: 0,
        initial_time_video: '00:00:00',
        finish_time_video: '00:00:00',
        finish_time_video_to_show: moment('00:00:00', 'HH:mm:ss'),
        initial_time_video_to_show: moment('00:00:00', 'HH:mm:ss'),
        isEditable: true,
        showSaveAndCancelButton: isEdit ? true : false,
        toCreateOnModalEdit: isEdit ? true : false,
      }
    ];

    setWorkElementsAdded(newArray);
  }

  function handleChangeWorkElement(index, id) {
    console.log(id);

    let newArray = [...workElementsAdded];
    const values = workElements.find(
      (test) => test.id === id
    );
    newArray[index].work_element_id = values.id;
    newArray[index].work_element_name = values.name;

    setWorkElementsAdded(newArray);

  }

  function removeSubProducts(indexOfItem: number) {

    let newArray = [...workElementsAdded];
    newArray.splice(indexOfItem, 1);
    setWorkElementsAdded(newArray);
  }

  function handleChangeOrder(index, value) {
    let newArray = [...workElementsAdded];

    newArray[index].sequential_order = Number(value) > 0 ? Number(value) : 0;

    console.log(newArray);

    setWorkElementsAdded(newArray);
  }

  function handleChangeInitialTime(index, value) {


    let newArray = [...workElementsAdded];

    if (value === '') {
      newArray[index].initial_time_video = '00:00:00';
      newArray[index].initial_time_video_to_show = moment('00:00:00', 'HH:mm:ss');
      setWorkElementsAdded(newArray);
      return
    }

    if (newArray[index].finish_time_video > '00:00:00' && value > newArray[index].finish_time_video) {
      Notification({
        type: 'error',
        title: 'Inválido',
        description: 'O Valor final não pode ser menor que o inical'
      })
      newArray[index].initial_time_video = newArray[index].finish_time_video;
      newArray[index].initial_time_video_to_show = moment(value, 'HH:mm:ss');
      newArray[index].finish_time_video = value;
      newArray[index].finish_time_video_to_show = moment(value, 'HH:mm:ss');
      setWorkElementsAdded(newArray);
      return;
    }

    newArray[index].initial_time_video = value;
    newArray[index].initial_time_video_to_show = moment(value, 'HH:mm:ss');
    newArray[index].finish_time_video = value;
    newArray[index].finish_time_video_to_show = moment(value, 'HH:mm:ss');

    setWorkElementsAdded(newArray);
  }

  function handleChangeFinishTime(index, value) {
    let newArray = [...workElementsAdded];

    if (value === '') {
      newArray[index].finish_time_video = newArray[index].initial_time_video;
      newArray[index].finish_time_video_to_show = moment(newArray[index].initial_time_video, 'HH:mm:ss');
      setWorkElementsAdded(newArray);
      return
    }

    if (newArray[index].initial_time_video > value) {
      Notification({
        type: 'error',
        title: 'Inválido',
        description: 'O Valor final não pode ser menor que o inical'
      })
      newArray[index].finish_time_video = newArray[index].initial_time_video;
      newArray[index].finish_time_video_to_show = moment(newArray[index].initial_time_video, 'HH:mm:ss');
      setWorkElementsAdded(newArray);
      return;
    }

    console.log('seguiu');

    newArray[index].finish_time_video = value;
    newArray[index].finish_time_video_to_show = moment(value, 'HH:mm:ss');


    console.log(newArray);

    setWorkElementsAdded(newArray);
  }

  async function handleDeleteItemOfArrayOnEdition(index) {
    const newArray = [...workElementsAdded];

    try {
      const response = await api.delete(`/chronoanalysis/process-sub-product-work-element/${newArray[index].id}`);
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

  function handleClickEditItemOfArrayOnEdition(index) {
    let newArray = [...workElementsAdded];
    let arrayForEdition = [...auxWorkElementsAdded];

    newArray[index].showSaveAndCancelButton = true;
    newArray[index].isEditable = true;
    arrayForEdition[0].id = newArray[index].id;
    arrayForEdition[0].sequential_order = newArray[index].sequential_order;
    arrayForEdition[0].work_element_id = newArray[index].work_element_id;
    arrayForEdition[0].work_element_name = newArray[index].work_element_name;
    arrayForEdition[0].initial_time_video = newArray[index].initial_time_video;
    arrayForEdition[0].initial_time_video_to_show = newArray[index].initial_time_video_to_show;
    arrayForEdition[0].finish_time_video = newArray[index].finish_time_video;
    arrayForEdition[0].finish_time_video_to_show = newArray[index].finish_time_video_to_show;
    arrayForEdition[0].isEditable = newArray[index].isEditable;

    console.log(newArray[index].showSaveAndCancelButton, newArray[index].isEditable);

    setAuxWorkElementsAdded(arrayForEdition);
    setWorkElementsAdded(newArray);
  }

  async function saveEditedItemOfArrayOnEdition(index) {
    let newArray = [...workElementsAdded];

    if (
      newArray[index].work_element_id === '' ||
      newArray[index].sequential_order === 0 ||
      newArray[index].finish_time_video === '00:00:00'
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
        workElementsAdded.map(async (item) => {
          return item.process_sub_product_id = subProductId;
        })
        const response = await api.post(`chronoanalysis/process-sub-product-work-element/`, newArray[index]);
        newArray[index].isEditable = false;
        newArray[index].showSaveAndCancelButton = false;
        newArray[index].id = response.data.id;
        newArray[index].toCreateOnModalEdit = false;
        setWorkElementsAdded(newArray);
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
      const response = await api.put(`chronoanalysis/process-sub-product-work-element/${newArray[index].id}`, newArray[index]);
      newArray[index].isEditable = false;
      newArray[index].showSaveAndCancelButton = false;
      newArray[index].id = response.data.id;
      setWorkElementsAdded(newArray);
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

  function cancelItemEdition(index) {
    let newArray = [...workElementsAdded];
    let arrayOfLatestValueOnSpecificIndex = [...auxWorkElementsAdded];

    newArray[index].sequential_order = arrayOfLatestValueOnSpecificIndex[0].sequential_order;
    newArray[index].work_element_id = arrayOfLatestValueOnSpecificIndex[0].work_element_id;
    newArray[index].work_element_name = arrayOfLatestValueOnSpecificIndex[0].work_element_name;
    newArray[index].initial_time_video = arrayOfLatestValueOnSpecificIndex[0].initial_time_video;
    newArray[index].initial_time_video_to_show = arrayOfLatestValueOnSpecificIndex[0].initial_time_video_to_show;
    newArray[index].finish_time_video = arrayOfLatestValueOnSpecificIndex[0].finish_time_video;
    newArray[index].finish_time_video_to_show = arrayOfLatestValueOnSpecificIndex[0].finish_time_video_to_show;
    newArray[index].isEditable = false;
    newArray[index].showSaveAndCancelButton = false;

    setWorkElementsAdded(newArray);
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
            placeholder={`Search ${dataIndex} `}
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
        width={1000}
        footer={[
          <Button key="back" onClick={handleClose} type="default">
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={isEdit ? handleEdit : handleRegister}
          >
            Salvar
          </Button>,
        ]}
      >
        <Row>
          <Form.Item
            labelCol={{ span: 23 }}
            label="Nome:"
            labelAlign={'left'}
            style={{ backgroundColor: 'white', fontWeight: 'bold' }}
            required
          >

            <Col span={20}>
              <Input
                key="sub-productName"
                size="large"
                style={{ width: 400 }}
                placeholder="Nome do Sub-Produto"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </Col>

          </Form.Item>
        </Row>

        <Row>
          <Col span={6}>
            <p>Selecione o Video do Produto</p>
            {videoIsDefined != true && uploadButton}
            {videoIsDefined === true && videoUploadSucces}
          </Col>
          <Col span={9}>

            <Form.Item
              key="productFormItem"
              labelCol={{ span: 23 }}
              label="Sub Linha:"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Select
                key="subLineName"
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

        <Divider />

        {workElementsAdded.map((selectedIten, index) => (
          <Row gutter={8}>
            <Col span={2}>
              <Form.Item
                key="removeFormItem"
                label="Ordem: "
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
                  disabled={!selectedIten.isEditable}
                  placeholder="0"
                  value={selectedIten.sequential_order}
                  onChange={(e) => handleChangeOrder(index, e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                key="workElementFormItem"
                labelCol={{ span: 23 }}
                label="Elemento de Trabalho:"
                labelAlign={'left'}
                style={{
                  backgroundColor: 'white',
                }}
                required
              >
                <Select
                  key="workElementName"
                  size="large"
                  disabled={!selectedIten.isEditable}
                  value={selectedIten.work_element_id}
                  onChange={(e) => {
                    handleChangeWorkElement(index, e)
                  }}
                >
                  {workElements.map((item) => (
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
                key="startVideoFormItem"
                labelCol={{ span: 23 }}
                label="Início:"
                labelAlign={'left'}
                style={{
                  backgroundColor: 'white',
                }}
                required
              >
                <TimePicker
                  size="large"
                  defaultValue={moment('00:00:00', 'HH:mm:ss')}
                  disabled={!selectedIten.isEditable}
                  value={selectedIten.initial_time_video_to_show}
                  onChange={(e, timeAsString) => { handleChangeInitialTime(index, timeAsString) }}
                />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item
                key="finalVideoFormItem"
                labelCol={{ span: 23 }}
                label="Final:"
                labelAlign={'left'}
                style={{
                  backgroundColor: 'white',
                }}
                required
              >
                <TimePicker
                  size="large"
                  disabled={!selectedIten.isEditable}
                  value={selectedIten.finish_time_video_to_show}
                  defaultValue={moment('00:00:00', 'HH:mm:ss')}
                  onChange={(e, timeAsString) => { handleChangeFinishTime(index, timeAsString) }}
                />

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


            {(workElementsAdded.length != 1 && selectedIten.showSaveAndCancelButton === false && !isEdit) && (
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

            {workElementsAdded.length - 1 === index &&
              (
                <Button
                  key="primary"
                  title="Novo Sub Produto"
                  disabled={
                    selectedIten.finish_time_video > '00:00:00' &&
                      selectedIten.work_element_id !== '' &&
                      selectedIten.sequential_order != 0 ? false : true
                  }
                  style={{
                    width: '100%',
                    color: 'white',
                    backgroundColor: 'rgb(5, 155, 50)',
                  }}
                  onClick={(e) => {

                    const newArray = [...workElementsAdded];
                    isEdit ?
                      () => {
                        newArray[index].toCreateOnModalEdit = true;
                      }
                      :
                      () => {
                        newArray[index].toCreateOnModalEdit = false;
                      }

                    addNewSubProduct(e)
                  }}
                >
                  <PlusOutlined />
                  Novo Elemento de Trabalho
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
    const subLine = await apiClient.get('/chronoanalysis/sub-production-line/');
    const workElement = await apiClient.get('/chronoanalysis/work-element');


    return {
      props: {
        subProduct: data,
        subLine: subLine.data,
        workElement: workElement.data,
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
