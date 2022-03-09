import React, { useEffect, useState } from 'react';
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

import Highlighter from 'react-highlight-words';
import styles from '../../../styles/app.module.scss';
import { Typography } from 'antd';

import { Notification } from '../../../components/Notification';
import { api } from '../../../services/api';
import { GetServerSideProps } from 'next';
import { getAPIClient } from '../../../services/axios';

import { Divider } from 'antd';

const { Title } = Typography;
const { Option } = Select;
interface ITolerance {
  id: string,
  type: string,
  classification: string,
  factor: number,
}

interface IProps {
  tolerance: ITolerance[];
}

export default function WorkElement({ tolerance }: IProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tolerances, setTolerances] = useState<ITolerance[]>(tolerance);
  console.log(tolerances);

  const [toleranceAdded, setToleranceAdded] = useState(
    [
      { id: '', type: '', classification: '' },
      { id: '', type: '', classification: '' },
      { id: '', type: '', classification: '' },
      { id: '', type: '', classification: '' },
      { id: '', type: '', classification: '' },
      { id: '', type: '', classification: '' },
      { id: '', type: '', classification: '' },
    ])
  const [workElements, setWorkElements] = useState([]);
  const [workElementName, setWorkElementName] = useState<string>('');
  const [tolerancesTypes, setTolerancesTypes] = useState(
    [
      'Esforço físico em kg',
      'Esforço mental',
      'Monotonia',
      'Necessidades pessoais',
      'Recuperação de fadiga',
      'Ruídos',
      'Temperatura ambiente'
    ]);
  const [tolerancesClassification, setTolerancesClassification] = useState([]);
  const [workElementId, setWorkElementId] = useState('');


  async function handleRegister(e) {
    e.preventDefault();

    if (workElementId) {
      try {
        if (workElementName == '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Não foi possível editar o Produto de Processo',
          });
        }
        const data = {
          work_element_id: workElementId,
          factor: toleranceAdded,
        };
        setLoading(true);
        const response = await api.post(`/chronoanalysis/work-element/${workElementId}`, { name: workElementName });

        const responseTolerance = await api.post(`/chronoanalysis/work-element-factor/${workElementId}`, { factor: data });
        console.log('AAAAAAA: ', response.data);


        const filterWorkElements = workElements.filter((iten) => {
          if (iten.id == workElementId) {
            return iten;
          }
        });

        filterWorkElements.push(response.data);

        setWorkElements(filterWorkElements);
        setLoading(false);
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Elemento de Trabalho Editado com sucesso',
        });
      } catch (error) {
        console.error(error);
        Notification({
          type: 'error',
          title: 'Erro',
          description: 'Não foi possível Editar o Elemento de Trabalho',
        });
        setLoading(false);
      }
    } else {
      try {
        if (workElementName === '') {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Não foi possível cadastrar o Produto de Processo',
          });
        }


        setLoading(true);
        const response = await api.post(`/chronoanalysis/work-element`, { name: workElementName });

        const data = {
          work_element_id: response.data.id,
          factor: toleranceAdded,
        };


        const responseReult = await api.post(`/chronoanalysis/work-element-factor`, data);

        const newWorkElementRegistered = response.data;

        workElements.push(response.data);

        setWorkElements(workElements);
        setLoading(false);

        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Produto de Processo Cadastrado com sucesso',
        });

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

    setWorkElementId('');
  }

  function handleClose() { }

  function handleChangeToleranceType(index, id) {
    let newArray = [...toleranceAdded];
    const value = tolerances.find(
      (toleranceItem) => toleranceItem.id === id
    );

    newArray[index].type = value.type;

    var filteredItems = tolerances.filter(function (obj) { return obj.type == newArray[index].type; });
    setTolerancesClassification(filteredItems)

    console.log(newArray);

    setToleranceAdded(newArray);
  }

  function handleChangeToleranceClassification(index, id) {
    let newArray = [...toleranceAdded];
    const value = tolerances.find(
      (toleranceItem) => toleranceItem.id === id
    );

    newArray[index].classification = value.classification;
    newArray[index].id = value.id;

    setToleranceAdded(newArray);
    console.log(newArray);

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
          <Table columns={columns} dataSource={workElements} />
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
              Cadastrar Elemento de Trabalho
            </Button>
          </Col>
        </Row>
        <SearchTable />
      </Layout>
      <Modal
        title="Cadastrar Elemento de Trabalho"
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
            key="categorieName"
            size="large"
            style={{ width: 400, marginBottom: '10px' }}
            placeholder="Nome do Sub-Produto"
            value={workElementName}
            onChange={(e) => {
              setWorkElementName(e.target.value);
            }}
          />
        </Form.Item>

        {toleranceAdded.map((selectedIten, index) => (
          <Row gutter={10}>
            <Col span={12}>
              <Form.Item
                key="TypeFormItem"
                labelCol={{ span: 23 }}
                label="Tipo:"
                labelAlign={'left'}
                style={{
                  backgroundColor: 'white',
                }}
                required
              >
                <Input
                  key="toleranceTypeName"
                  size="large"
                  value={tolerancesTypes[index]}
                  contentEditable={false}
                />
              </Form.Item>

            </Col>
            <Col span={12}>
              <Form.Item
                key="classificationFormItem"
                labelCol={{ span: 23 }}
                label="Classificação:"
                labelAlign={'left'}
                style={{
                  backgroundColor: 'white',
                }}
                required
              >
                <Select
                  showSearch
                  key="toleranceClassificationName"
                  size="large"
                  value={selectedIten.classification}
                  onFocus={(e) => {
                    var filteredItems = tolerances.filter(
                      function (obj) {
                        return obj.type === tolerancesTypes[index];
                      }
                    );
                    setTolerancesClassification(filteredItems)
                  }}
                  onChange={(e) => {
                    handleChangeToleranceClassification(index, e)
                  }}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children
                      .toLowerCase()
                      .localeCompare(optionB.children.toLowerCase())
                  }
                >
                  {tolerancesClassification.map((item) => (
                    <>
                      <Option key={item.id} value={item.id}>
                        {item.classification}
                      </Option>
                    </>
                  ))}
                </Select>
              </Form.Item>

            </Col>

            {/* {toleranceAdded.length - 1 === index && (
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
            )} */}
          </Row>
        ))}
      </Modal>
    </div >
  )
};


export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const tolerances = await apiClient.get('/chronoanalysis/tolerance-factor/');
    const { data } = await apiClient.get('/chronoanalysis/work-element');

    console.log(tolerances);



    return {
      props: {
        workelement: data,
        tolerance: tolerances.data,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        workelement: [],
      },
    };
  }
};

