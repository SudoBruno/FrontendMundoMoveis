import { Divider } from 'antd';
import { GetServerSideProps } from 'next';
import BarCode from 'react-barcode';
import { getAPIClient } from '../../../../services/axios';
import styles from '../../../../styles/warehouse/tag.module.scss'

interface IStock {
  id: string;
  quantity: string;
  position_name: string;
  raw_material_name: string;
  raw_material_code: string;
  unit_of_measurement_name: string;
  bar_code: string;
  warehouse_name: string;
  user_name: string;
}

interface ITagProps {
  stock: IStock;
}

export default function WarehouseTag({ stock }: ITagProps) {
  return (
    <div className={styles.tag}>

      <img src='/logo.png' style={{ height: '45px' }} />

      <Divider />
      <div className={styles.body}>
        <div >
          <b>Almoxarifado</b>
          <p>{stock.warehouse_name}</p>
          <b>Insumo</b>
          <p>{stock.raw_material_name}</p>
        </div>
        <div >
          <b>Posição</b>
          <p>{stock.position_name}</p>
          <b>quantidade</b>
          <p>{stock.quantity}</p>
        </div>
      </div>
      <Divider />

      <div className={styles.operations}>
        <p>QTDE ATUAL</p>
        <p>QTDE SAÍDA</p>
        <p>RESULTADO</p>
        <p>__________ - </p>
        <p>__________ =</p>
        <p>________</p>

        <p>__________ - </p>
        <p>__________ =</p>
        <p>________</p>

        <p>__________ - </p>
        <p>__________ =</p>
        <p>________</p>

        <p>__________ - </p>
        <p>__________ =</p>
        <p>________</p>

        <p>__________ - </p>
        <p>__________ =</p>
        <p>________</p>


      </div>
      <Divider />

      <div className={styles.barCode}>
        <BarCode
          value={stock.bar_code}
          width={1}
          height={30}
          fontSize={20}
        />
      </div>

    </div>

  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);

  const { barcode } = context.params;
  const { data } = await apiClient.get('warehouse/stock/barcode', {
    params: {
      bar_code: barcode,
    },
  });

  return {
    props: {
      stock: data,
    },
  };
};
