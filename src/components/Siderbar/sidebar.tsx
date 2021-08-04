import {
  DashboardOutlined, FileExcelOutlined, PlusOutlined, RightSquareOutlined, SearchOutlined, ShoppingCartOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, Result } from 'antd';
import 'antd/dist/antd.css';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { FiPackage } from 'react-icons/fi';
import { Header } from '../Header';
import { useRouter } from 'next/router'

const { Sider, Content } = Layout;
const { SubMenu } = Menu;

interface SidebarProps {
  screen: ReactNode;
  display: boolean;
}

export default function Sidebar({ screen, display }: SidebarProps) {
  const router = useRouter();

  return (
    <>
      {display ? (
        <Layout>
          <Sider
            breakpoint="lg"
            collapsedWidth="0"
            style={{ minHeight: '100vh' }}
          >
            <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
              <Menu.Item key="Dashboard" icon={<DashboardOutlined />}>
                <Link href="/Profile">Dashboard</Link>
              </Menu.Item>
              <SubMenu
                key="WnsInsumos"
                title="Almoxarifado"
                icon={
                  <span className="anticon anticon-bank">
                    <FiPackage size={16} color="#fff" />
                  </span>
                }
              >
                <SubMenu
                  key="WnsInsumosCadastros"
                  title="Cadastros"
                  icon={<PlusOutlined />}
                >
                  <Menu.Item key="Almoxarifado" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Register/warehouse">
                      Almoxarifado
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="Un.Medidas" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Register/unityMeasure">
                      Un. Medidas
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="Categoria" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Register/categories">Categoria</Link>
                  </Menu.Item>

                  <Menu.Item key="Fornecedores" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Register/supplier">
                      Fornecedores
                    </Link>
                  </Menu.Item>

                  <Menu.Item key="Insumos" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Register/rawMaterial">Insumos</Link>
                  </Menu.Item>

                  <Menu.Item key="Posições" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Register/position">Posições</Link>
                  </Menu.Item>
                </SubMenu>

                <SubMenu
                  key="WnsInsumosOperacao"
                  title="Operações"
                  icon={<ShoppingCartOutlined />}
                >
                  <Menu.Item key="Entradas" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Operation/Receivement">Entrada</Link>
                  </Menu.Item>

                  <Menu.Item key="Armazenagens" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Operation/Storage">Armazenagem</Link>
                  </Menu.Item>

                  <Menu.Item key="Saídas" icon={<RightSquareOutlined />}>
                    <Link href="/Warehouse/Operation/Exit">Saída</Link>
                  </Menu.Item>

                  <Menu.Item
                    key="Alterar Estoque"
                    icon={<RightSquareOutlined />}
                  >
                    <Link href="/Warehouse/Operation/AlterStock">
                      Alterar Estoque
                    </Link>
                  </Menu.Item>
                </SubMenu>

                <SubMenu
                  key="WnsInsumosSearches"
                  title="Consultas"
                  icon={<SearchOutlined />}
                >
                  <Menu.Item key="Estoque" icon={<FileExcelOutlined />}>
                    <Link href="/Warehouse/Consult/Stock">Estoque</Link>
                  </Menu.Item>

                  <Menu.Item key="relat-saida" icon={<FileExcelOutlined />}>
                    <Link href="/wmsRawExit/Resume">Rel. Saídas</Link>
                  </Menu.Item>
                  <Menu.Item key="Rel.entrada" icon={<FileExcelOutlined />}>
                    <Link href="/wmsRawMaterial/Search/entry">
                      Rel. entrada
                    </Link>
                  </Menu.Item>

                  <Menu.Item key="PCP's" icon={<FileExcelOutlined />}>
                    <Link href="/wmsRawMaterial/pcp">PCP's</Link>
                  </Menu.Item>
                </SubMenu>
              </SubMenu>
            </Menu>
          </Sider>

          <Layout>
            {router.pathname !== '/Warehouse/Consult/Stock/[barcode]' &&
              <Header />
            }
            {screen && (
              <Content style={{ margin: '20px 16px 0' }}>
                <div>{screen}</div>
              </Content>
            )}
            {!screen && (
              <Content style={{ margin: '20px 16px 0' }}>
                <Result
                  status="500"
                  title="500"
                  subTitle="Sorry, something went wrong."
                  extra={<Button type="primary">Back Home</Button>}
                />
              </Content>
            )}
          </Layout>
        </Layout>
      ) : (
        <>{screen}</>
      )}
    </>
  );
}
