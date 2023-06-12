import { useState, useEffect } from 'react';
import Map from '../components/Map';
import TableUI from '../components/TableUI';
import DashboardHeader from '../components/DashboardHeader';
import api from '../service/api';
import '../style/pages/Dashboard.css';

const Dashboard = ({loginInfo}) => {
  const [tableData, setTableData] = useState(null);

  const handleTableData = (value) => {
    // console.log('value', value);
    setTableData(value);
  }

  // console.log(loginInfo)

  const accessToken = sessionStorage.getItem('accessToken');

  useEffect(()=> {
    api.post('/worker/start', {},
        {
            headers: {
            Authorization: `Bearer ${accessToken}`
            }
        }
      )
      .then((response) => {
        console.log(response.data)
      })
      .catch((error) => {
        console.error(error);
        if (error.response.status === 403) {
          window.location.href = '/';
      } else {
          console.error(error);
      }
      });

      api.post('/worker/listdetail', {},
      {
          headers: {
          Authorization: `Bearer ${accessToken}`
          }
      }
    )
    .then((response) => {
      console.log(response.data)
    })
    .catch((error) => {
      console.error(error);
      if (error.response.status === 403) {
        window.location.href = '/';
    } else {
        console.error(error);
    }
    });
  }, [accessToken]);

  return (
    <div className='dashboard'>
      <DashboardHeader loginInfo={loginInfo} />
      <div className='container'>
        {tableData && (
          <div className='map-container'>
            <Map value={tableData} />
          </div>
        )}
        <div className='table-container'>
          <TableUI onValueChange={handleTableData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;