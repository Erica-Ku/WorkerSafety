import { useRef, useEffect, useState } from 'react';
import InfoData from '../components/Data/InfoData';
import api from '../service/api';
import '../style/components/Map.css';

const GoogleMap = ({ value }) => {
  const [map, setMap] = useState(null);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(0);
  const [markers, setMarkers] = useState([]);
  const [isInfoDataVisible, setIsInfoDataVisible] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [workerData, setWorkerData] = useState([]);
  const [detailData, setDetailData] = useState([]);

  const mapRef = useRef(null);

  const data = [
    { id: 1, text: '정상' },
    { id: 2, text: '비정상' },
    { id: 3, text: '정상' },
    { id: 4, text: '정상' },
    { id: 5, text: '정상' },
    { id: 6, text: '정상' },
    { id: 7, text: '비정상' },
    { id: 8, text: '정상' },
  ];

  const linedata = [
    { data: [10, 41, 35, 51, 49, 62, 69, 91, 148] },
    { data: [20, 50, 60, 51, 70, 62, 50, 40, 100] },
    { data: [10, 30, 40, 51, 20, 62, 80, 70, 127] },
    { data: [30, 50, 70, 51, 40, 62, 80, 80, 110] },
    { data: [10, 30, 40, 51, 60, 62, 20, 70, 127] },
    { data: [30, 40, 60, 51, 30, 62, 80, 30, 150] },
    { data: [20, 30, 40, 51, 20, 62, 30, 70, 127] },
    { data: [10, 40, 20, 51, 30, 62, 40, 20, 133] },
  ];

  const accessToken = sessionStorage.getItem('accessToken');

  useEffect(()=> {
    api.get('/worker/list', 
          {
              headers: {
              Authorization: `Bearer ${accessToken}`
              }
          }
        )
        .then((response) => {
          const workerData = response.data;
          console.log(workerData);
          setWorkerData(workerData);
        })
        .catch((error) => {
          console.error(error);
          if (error.response.status === 403) {
            window.location.href = '/';
        } else {
            console.error(error);
        }
        });

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
        const detailData = response.data;
        console.log(detailData);
        setDetailData(detailData);
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

  // console.log(workerData);

  useEffect(() => {
    if (workerData.length > 0) {
        const locations = workerData.map((item, index) => ({
          lat: 35.23589 + index * 0.0005,
          lng: 129.07694 + index * 0.0005,
          component: (
            <InfoData
              data={data[index]}
              linedata={linedata[index]}
              workerData={item}
              detailData={detailData.list[0].userCode.userCode === (index + 1) ? detailData : null}
            />
          ),
        }));
      const intervalDuration = 700;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_CLIENT_ID}&libraries=geometry`;
      script.async = true;
      script.onload = () => {
        const google = window.google;
        const mapOptions = {
          center: new google.maps.LatLng(
            locations[0].lat,
            locations[0].lng
          ),
          zoom: 17,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
          },
        };
        const mapInstance = new google.maps.Map(
          mapRef.current,
          mapOptions
        );
        setMap(mapInstance);

        const selectedLocation = locations[selectedMarkerIndex];
        setSelectedComponent(selectedLocation.component);
        setIsInfoDataVisible(true);

        const markers = locations.map((location, index) => {
          const markerColor =
            location.component.props.data.text === '비정상'
              ? 'red'
              : 'black';
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(
              location.lat,
              location.lng
            ),
            map: mapInstance,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: markerColor,
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 1,
              scale: 7,
            },
          });
          marker.addListener('click', () => {
            setSelectedMarkerIndex(index);
            setSelectedComponent(location.component);
            setIsInfoDataVisible(true);
          });

          return marker;
        });
        setMarkers(markers);

        setInterval(() => {
          markers.forEach((marker, index) => {
            const position = marker.getPosition();
            const newPosition = new google.maps.LatLng(
              position.lat() +
                Math.random() * 0.0003 -
                0.0001,
              position.lng() +
                Math.random() * 0.0003 -
                0.0001
            );
            marker.setPosition(newPosition);
          });
        }, intervalDuration);
      };

      document.head.appendChild(script);
    }
  }, [workerData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (markers.some((marker) => marker.getIcon().fillColor === 'red')) {
        alert('위험 작업자가 있습니다!');
      }
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [markers]);

  const handleCloseInfoData = () => {
    setIsInfoDataVisible(false);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
      {isInfoDataVisible && (
        <div>
          {selectedComponent}
          <button onClick={handleCloseInfoData}>Close</button>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;