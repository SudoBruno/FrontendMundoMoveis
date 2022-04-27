import React, { FormEvent, useEffect, useRef, useState } from 'react';
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
import { MaskedInput } from 'antd-mask-input';

const { Option } = Select;

interface IWorkElement {
  id: string;
  name: string;
}

interface IProps {
  workElement: IWorkElement[];
  chronoanalysisList: Array<any>;
  notFound: boolean;
}

export default function Chronoanalysis({ workElement, chronoanalysisList }: IProps) {

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [chronoanalysisId, setChronoanalysisId] = useState<string>('');
  const [workElements, setWorkElements] = useState<IWorkElement[]>(workElement);
  const [workElementId, setWorkElementId] = useState('');
  const [timesAdded, setTimesAdded] = useState([
    {
      id: '',
      time: '',
      rate: 0,
      ratePercentual: 0,
      isEditable: true,
      showSaveAndCancelButton: false,
      toCreateOnModalEdit: false,
    },
    {
      id: '',
      time: '',
      rate: 0,
      ratePercentual: 0,
      isEditable: true,
      showSaveAndCancelButton: false,
      toCreateOnModalEdit: false,
    },
    {
      id: '',
      time: '',
      rate: 0,
      ratePercentual: 0,
      isEditable: true,
      showSaveAndCancelButton: false,
      toCreateOnModalEdit: false,
    }
  ]);
  const [auxtimesAdded, setAuxTimesAdded] = useState([
    {
      id: '',
      time: '',
      rate: 0,
      ratePercentual: 0,
      isEditable: true,
      showSaveAndCancelButton: false,
      toCreateOnModalEdit: false,
    },
    {
      id: '',
      time: '',
      rate: 0,
      ratePercentual: 0,
      isEditable: true,
      showSaveAndCancelButton: false,
      toCreateOnModalEdit: false,
    },
    {
      id: '',
      time: '',
      rate: 0,
      ratePercentual: 0,
      isEditable: true,
      showSaveAndCancelButton: false,
      toCreateOnModalEdit: false,
    }
  ]);

  const [chronoanalysis, setChronoanalysis] = useState<any[]>(chronoanalysisList);

  async function handleRegister() {

    try {
      if (workElementId === '') {
        setLoading(false);
        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível cadastrar a Cronoanálise',
        });
      }

      const data = {
        work_element_id: workElementId,
      };

      setLoading(true);
      const response = await api.post('/chronoanalysis/chronoanalysis/', data);



      await api.post(`/chronoanalysis/chronoanalysis-time/`, {
        chronoanalysis_id: response.data.id,
        time: timesAdded
      });

      setLoading(false);

      const newChronoanalysisRegistered = response.data;

      chronoanalysisList.push(newChronoanalysisRegistered);

      setChronoanalysis(chronoanalysisList);
      setIsModalOpen(false);
      setWorkElementId("");

      Notification({
        type: 'success',
        title: 'Enviado',
        description: 'Cronoanálise Cadastrada com sucesso',
      });


    } catch (error) {
      console.error(error);
      Notification({
        type: 'error',
        title: 'Erro',
        description: `${error.response.data.message}`,
      });
      setLoading(false);
    }

  }

  async function handleEdit() {
    try {
      if (workElementId === '') {
        setLoading(false);
        return Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não podem existir campos vazios',
        });
      }
      const data = {
        work_element_id: workElementId,
      };

      setLoading(true);
      const response = await api.put(`/chronoanalysis/chronoanalysis/${chronoanalysisId}`, data);

      const filterSubProducts = timesAdded.filter((iten) => {
        if (iten.id !== chronoanalysisId) {
          return iten;
        }
      });

      filterSubProducts.push(response.data)

      setChronoanalysis(filterSubProducts)
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

  function addNewTime(e) {
    e.preventDefault();

    const newArray = [
      ...timesAdded,
      {
        id: '',
        time: '',
        rate: 0,
        isEditable: true,
        ratePercentual: 0,
        showSaveAndCancelButton: isEdit ? true : false,
        toCreateOnModalEdit: isEdit ? true : false,
      },
    ];

    setTimesAdded(newArray);
  }

  function removeTimes(indexOfItem: number) {

    let newArray = [...timesAdded];
    newArray.splice(indexOfItem, 1);
    setTimesAdded(newArray);
  }

  function handleChangeTime(index, value) {

    let newArray = [...timesAdded];

    newArray[index].time = value;

    setTimesAdded(newArray);
  }

  function handleChangeRate(index, value) {

    let newArray = [...timesAdded];

    newArray[index].rate = Number(value) / 100;
    newArray[index].ratePercentual = Number(value);

    setTimesAdded(newArray);
  }

  function verifyTimes() {
    const newArray = [...timesAdded];
    let totalSum = 0;

    newArray.map((item, index) => {
      let time = item.time.split(':');
      let secondsOfItem = Number(time[2]) +
        Number(time[1]) * 60 +
        Number(time[0]) * 3600
      totalSum += secondsOfItem;
      console.log(item);

      console.log(secondsOfItem);

    })
  }

  async function handleFilterSubProductProcessById(data) {
    const responseResult = await api.get(`/chronoanalysis/chronoanalysis-time/${data.id}`);

    responseResult.data.map(item => {
      return Object.assign(item, {
        ratePercentual: item.rate * 100,
        isEditable: false,
        showSaveAndCancelButton: false,
        toCreateOnModalEdit: false,
      })
    })

    setTimesAdded(responseResult.data);
    setChronoanalysisId(data.id);
    setWorkElementId(responseResult.data[0].chronoanalysis.work_element.id);
    setIsEdit(!isEdit);
    setIsModalOpen(true);
  }

  async function handleDeleteItemOfArrayOnEdition(index) {
    const newArray = [...timesAdded];

    try {
      const response = await api.delete(`/chronoanalysis/chronoanalysis-time/${newArray[index].id}`);
      removeTimes(index);
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

  async function handleClickEditItemOfArrayOnEdition(index) {
    let newArray = [...timesAdded];
    let arrayForEdition = [...auxtimesAdded];

    newArray[index].showSaveAndCancelButton = true;
    newArray[index].isEditable = true;
    arrayForEdition[0].id = newArray[index].id;
    arrayForEdition[0].ratePercentual = newArray[index].rate * 100;
    arrayForEdition[0].time = newArray[index].time;
    arrayForEdition[0].isEditable = newArray[index].isEditable;

    setAuxTimesAdded(arrayForEdition);
    setTimesAdded(newArray);
  }

  function cancelItemEdition(index) {
    let newArray = [...timesAdded];
    let arrayOfLatestValueOnSpecificIndex = [...auxtimesAdded];

    if (!isEdit) {
      removeTimes(index);
      return;
    }

    newArray[index].id = arrayOfLatestValueOnSpecificIndex[0].id;
    newArray[index].time = arrayOfLatestValueOnSpecificIndex[0].time;
    newArray[index].rate = arrayOfLatestValueOnSpecificIndex[0].rate;
    newArray[index].ratePercentual = arrayOfLatestValueOnSpecificIndex[0].ratePercentual;
    newArray[index].isEditable = false;
    newArray[index].showSaveAndCancelButton = false;

    setTimesAdded(newArray);
  }

  async function saveEditedItemOfArrayOnEdition(index) {
    let newArray = [...timesAdded];

    if (
      newArray[index].time == '_:_:_' ||
      newArray[index].time == '00:00:00' ||
      newArray[index].rate === 0
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

        const response = await api.post(`chronoanalysis/chronoanalysis-time/`, {
          chronoanalysis_id: chronoanalysisId,
          time: [newArray[index]]
        });
        newArray[index].isEditable = false;
        newArray[index].showSaveAndCancelButton = false;
        newArray[index].id = response.data.id;
        newArray[index].toCreateOnModalEdit = false;
        setTimesAdded(newArray);
        Notification({
          type: 'success',
          title: 'Sucesso',
          description: 'Item Cadastrado com sucesso',
        });
        return;

      } catch (error) {
        console.error(error);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível Cadastrar o Item',
        });
      }

      return;
    }


    try {
      const response = await api.put(`chronoanalysis/chronoanalysis-time/${newArray[index].id}`, newArray[index]);

      newArray[index].isEditable = false;
      newArray[index].showSaveAndCancelButton = false;

      setTimesAdded(newArray);
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Item Editado com sucesso',
      });
    } catch (error) {
      console.error(newArray[index]);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Editado o Item',
      });
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/chronoanalysis/chronoanalysis/${id}`);

      const filterChronoanalisys = chronoanalysisList.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setChronoanalysis(filterChronoanalisys);
      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Cronoanálise Deletada com sucesso',
      });
    } catch (error) {
      console.error(error.response.data.message);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Deletar a Cronoanálise',
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
          title: 'Name',
          dataIndex: ["work_element", "name"],
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
          <Table columns={columns} dataSource={chronoanalysis} />
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
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              Cadastrar Cronoanálise
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>
      <Modal
        title="Cadastro de Cronoanálise"
        visible={isModalOpen}
        width={600}
        onCancel={() => { }}
        footer={[
          <Button key="back" onClick={() => { setIsEdit(false); setIsModalOpen(false) }} type="default">
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={false}
            onClick={isEdit ? handleEdit : handleRegister}
          >
            Salvar
          </Button>,
        ]}
      >
        <Row>
          <Col span={22}>
            <Form.Item
              key="productFormItem"
              labelCol={{ span: 23 }}
              label="Elemento de Trabalho:"
              labelAlign={'left'}
              style={{
                backgroundColor: 'white',
              }}
              required
            >
              <Select
                key="managerName"
                size="large"
                value={workElementId}
                onChange={(e) => {
                  setWorkElementId(e.toString());
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
            {/* <p>Selecione uma foto do Produto</p>
            {imageIsDefined != true && uploadButton}
            {imageIsDefined === true && imageUploadSucces} */}
          </Col>
        </Row>
        <Divider />
        <h2>Tempos</h2>
        <br></br>
        {timesAdded.map((item, index) => (
          <>
            <Row gutter={5}>
              <Col span={7}>
                <Form.Item
                  key="timeForm"
                  labelCol={{ span: 23 }}
                  label="Tempo"
                  labelAlign={'left'}
                  style={{
                    backgroundColor: 'white',
                  }}
                  required
                >
                  <MaskedInput
                    key="totalKey"
                    mask={
                      '00:00:00'
                    }
                    disabled={!item.isEditable}
                    size="large"
                    value={item.time}
                    onChange={(e) => { handleChangeTime(index, e.target.value); }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  key="rateForm"
                  labelCol={{ span: 23 }}
                  label="Ritmo em %"
                  labelAlign={'left'}
                  style={{
                    backgroundColor: 'white',
                  }}
                  required
                >
                  <Input
                    key="totalKey"
                    type="number"
                    size="large"
                    disabled={!item.isEditable}
                    value={item.ratePercentual}
                    onChange={(e) => { handleChangeRate(index, e.target.value) }}
                  />
                </Form.Item>
              </Col>
              {(isEdit && item.showSaveAndCancelButton === false) &&
                <Col>
                  <Button
                    style={{ marginTop: 35, color: 'blue', borderColor: 'blue' }}
                    onClick={() => handleClickEditItemOfArrayOnEdition(index)}
                  >
                    <FormOutlined />
                  </Button>
                </Col>
              }


              {(timesAdded.length != 1 && item.showSaveAndCancelButton === false && !isEdit) && (
                <Col>
                  <Popconfirm
                    title="Confirmar remoção?"
                    onConfirm={() => {
                      removeTimes(index)
                    }}
                  >
                    <Button danger style={{ marginTop: 35 }}><DeleteOutlined /></Button>
                  </Popconfirm>
                </Col>
              )}


              {(item.showSaveAndCancelButton === false && isEdit) && (
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


              {(item.showSaveAndCancelButton && item.isEditable) &&
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


              {(item.showSaveAndCancelButton && item.isEditable) &&
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

            </Row>
            {timesAdded.length - 1 === index && (
              <Button
                key="primary"
                title="Novo Sub Produto"
                style={{

                  width: '100%',
                  color: 'white',
                  backgroundColor: 'rgb(5, 155, 50)',
                }}
                onClick={(e) => {
                  addNewTime(e)
                }}
              >
                <PlusOutlined />
                Novo Tempo
              </Button>
            )}
          </>
        ))}
        <Divider />
        <Row>


        </Row>
      </Modal>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const workElement = await apiClient.get('/chronoanalysis/work-element');
    const chronoanalysisList = await apiClient.get('/chronoanalysis/chronoanalysis');

    return {
      props: {
        workElement: workElement.data,
        chronoanalysisList: chronoanalysisList.data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        product: [],
        time: []
      },
    };
  }
};