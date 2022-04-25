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


const { Title } = Typography;
const { Option } = Select;
interface ITolerance {
  id: string,
  type: string,
  classification: string,
  factor: number,
}

interface IWorkElement {
  id: string,
  name: string
}
interface IProps {
  tolerance: ITolerance[];
  workElement: IWorkElement[];
}

export default function WorkElement({ tolerance, workElement }: IProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tolerances, setTolerances] = useState<ITolerance[]>(tolerance);

  const [toleranceAdded, setToleranceAdded] = useState(
    [
      { id: '', type: '', classification: '', factor: 0, },
      { id: '', type: '', classification: '', factor: 0, },
      { id: '', type: '', classification: '', factor: 0, },
      { id: '', type: '', classification: '', factor: 0, },
      { id: '', type: '', classification: '', factor: 0, },
      { id: '', type: '', classification: '', factor: 0, },
      { id: '', type: '', classification: '', factor: 0, },
    ])
  const [workElements, setWorkElements] = useState(workElement);
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
  const [workElementFactor, setWorkElementFactor] = useState([])
  const [factorCalculated, setFactorCalculated] = useState(0);
  const [numberPeopleNeeded, setNumberPeopleNeeded] = useState<number>(0);

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
        else if (numberPeopleNeeded <= 0) {
          setLoading(false);
          return Notification({
            type: 'error',
            title: 'Erro',
            description: 'Número de pessoas não pode ser menor ou igual a zero',
          });
        }

        let response;

        setLoading(true);
        try {
          response = await api.put(`/chronoanalysis/work-element/${workElementId}`,
            {
              name: workElementName,
              number_people_needed: numberPeopleNeeded
            }
          );
        } catch (error) {
          console.error(error.response.data.message);
          Notification({
            type: 'error',
            title: 'Erro',
            description: error.response.data.message,
          });
          setLoading(false);
          return;
        }



        workElementFactor.map(async (factor, index) => {
          try {
            const responseTolerance = await api.put(`/chronoanalysis/work-element-factor/${factor.id}`, { factor: [toleranceAdded[index]] });
          } catch (error) {
            console.error(error.response.data.message);
            Notification({
              type: 'error',
              title: 'Erro',
              description: 'Existem Elementos de Trabalho Vazios',
            });
            setLoading(false);
            return;
          }
        })

        const filterWorkElements = workElements.filter((iten) => {
          if (iten.id != workElementId) {
            return iten;
          }
        });

        filterWorkElements.push(response.data);


        setWorkElements(filterWorkElements);
        handleClose();
        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Elemento de Trabalho Editado com sucesso',
        });
      } catch (error) {
        console.error(error.response);
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
            description: 'O Nome Não Pode Ser Vazio',
          });
        }
        let response;

        setLoading(true);

        response = await api.post(`/chronoanalysis/work-element`,
          {
            name: workElementName,
            number_people_needed: numberPeopleNeeded
          }
        );

        const data = {
          work_element_id: response.data.id,
          factor: toleranceAdded,
        };

        const responseResult = await api.post(`/chronoanalysis/work-element-factor/`, data);

        const newWorkElementRegistered = response.data;

        workElements.push(newWorkElementRegistered);

        console.log(responseResult.data);


        setWorkElements(workElements);
        handleClose();

        Notification({
          type: 'success',
          title: 'Enviado',
          description: 'Elemento de Trabalho Cadastrado com sucesso',
        });
      } catch (error) {
        console.error(error.response.data.message);
        Notification({
          type: 'error',
          title: 'Erro',
          description: error.response.data.message,
        });
        setLoading(false);
      }
    }

  }

  function handleClose() {
    setIsModalOpen(false);
    setLoading(false);
    setWorkElementId('');
    setWorkElementName('');
    setToleranceAdded([
      { id: '', type: '', classification: '', factor: 0, },
      { id: '', type: '', classification: '', factor: 0, },
      { id: '', type: '', classification: '', factor: 0, },
      { id: '', type: '', classification: '', factor: 0, },
      { id: '', type: '', classification: '', factor: 0, },
      { id: '', type: '', classification: '', factor: 0, },
      { id: '', type: '', classification: '', factor: 0, },
    ]);
  }

  function handleChangeToleranceClassification(index, id) {
    let newArray = [...toleranceAdded];
    const lastItemOfArray = 6;
    const value = tolerances.find(
      (toleranceItem) => toleranceItem.id === id
    );

    newArray[index].classification = value.classification;
    newArray[index].id = value.id;
    newArray[index].factor = value.factor;

    calculateResultOfMultiplyingFactors(toleranceAdded);


    setToleranceAdded(newArray);

  }

  async function handleEdit(data) {
    const responseResult = await api.get(`/chronoanalysis/work-element-factor/${data.id}`);

    const filteredItems = responseResult.data.map((item) => {
      return item.factor
    })

    setWorkElementFactor(responseResult.data);

    const filteredTypes = filteredItems.map((item) => {
      return item.type
    });

    calculateResultOfMultiplyingFactors(filteredItems);

    setTolerancesTypes(filteredTypes);
    setWorkElementId(data.id);
    setWorkElementName(data.name);
    setNumberPeopleNeeded(Number(data.number_people_needed));
    setToleranceAdded(filteredItems);
    setIsModalOpen(true);

  }

  async function handleDelete(id) {
    try {
      const responseResult = await api.delete(`/chronoanalysis/work-element/${id}`);

      const filteredWorkElements = workElements.filter((iten) => {
        if (iten.id !== id) {
          return iten;
        }
      });

      setWorkElements(filteredWorkElements);

      Notification({
        type: 'success',
        title: 'Sucesso',
        description: 'Elemento de Trabalho Deletado com sucesso',
      });
    } catch (error) {
      console.error(error.response.data.message);
      Notification({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível Deletar o Elemento de Trabalho',
      });
    }
  }

  function calculateResultOfMultiplyingFactors(data: Array<any>) {
    console.log(data);

    let result = 1;
    for (let index = 0; index < data.length; index++) {
      result = result + data[index].factor;
    }

    setFactorCalculated(result);

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
          title: 'Número de pessoas',
          dataIndex: 'number_people_needed',
          key: 'number_people_needed',
          width: '40%',
          ...this.getColumnSearchProps('number_people_needed'),
          sorter: (a, b) => a.number_people_needed.length - b.number_people_needed.length,
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
        width={700}
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
          <Col span={12}>
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
                style={{ marginBottom: '10px' }}
                placeholder="Nome do Elemento de Trabalho"
                value={workElementName}
                onChange={(e) => {
                  setWorkElementName(e.target.value);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              labelCol={{ span: 23 }}
              label="Número de Pessoas:"
              labelAlign={'left'}
              style={{ backgroundColor: 'white', fontWeight: 'bold' }}
              required
            >
              <Input
                key="numberPeopleNeeded"
                type="number"
                size="large"
                style={{ width: 70 }}
                placeholder="0"
                value={numberPeopleNeeded}
                onChange={(e) => {
                  setNumberPeopleNeeded(Number(e.target.value));
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {toleranceAdded.map((selectedIten, index) => (
          <Row gutter={10}>
            <Col span={8}>
              <Form.Item
                key="TypeFormItem"
                labelCol={{ span: 23 }}
                label="Tipo:"
                labelAlign={'left'}
                style={{
                  backgroundColor: 'white',
                }}
              >
                <Input
                  key="toleranceTypeName"
                  size="large"
                  readOnly
                  value={tolerancesTypes[index]}
                  contentEditable={false}
                />
              </Form.Item>

            </Col>
            <Col span={11}>
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
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                    0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.props.children
                      .toLowerCase()
                      .localeCompare(optionB.props.children.toLowerCase())
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
            <Col span={3}>
              <Form.Item
                key="FactorFormItem"
                labelCol={{ span: 23 }}
                label="Tipo:"
                labelAlign={'left'}
                style={{
                  backgroundColor: 'white',
                }}
              >
                <Input
                  key="toleranceFactorName"
                  size="large"
                  value={selectedIten.factor}
                  readOnly
                />
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
        <Title style={{ textAlign: 'center' }} level={3}>Fator: {factorCalculated.toFixed(2)}</Title>
      </Modal>
    </div >
  )
};


export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);
  try {
    const tolerances = await apiClient.get('/chronoanalysis/tolerance-factor/');
    const { data } = await apiClient.get('/chronoanalysis/work-element');

    return {
      props: {
        workElement: data,
        tolerance: tolerances.data,
      },
    };
  } catch (error) {
    console.error(error.response);
    return {
      props: {
        workelement: [],
      },
    };
  }
};

