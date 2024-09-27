import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { DataGrid } from '@mui/x-data-grid'; // Import MUI DataGrid
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'; // Import MUI Select and related components
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import logo from './assets/transparent_cropped_logo.png';
import locations from './assets/locations.json';
import deals from './assets/deals.json';

import '@fortawesome/fontawesome-free/css/all.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './dashboard.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiYnVkdG5kZXIiLCJhIjoiY20xZmUwYW43MjZvYjJxb2FzY3gxdGR4cCJ9.7BY51LXeOKEHES9pYbBV3A';


// Default Font Awesome Leaflet marker
const defaultIcon = L.divIcon({
  className: 'custom-marker-icon', // Custom CSS class to style the marker
  html: '<i class="fas fa-map-marker-alt" style="font-size: 20px; color: #365fa6;"></i>', // Font Awesome marker icon in red
  iconSize: [20, 30], // Icon size
  iconAnchor: [10, 30], // Point of the icon that corresponds to marker's location
  popupAnchor: [0, -30] // Position of the popup relative to the icon
});

// Highlighted Font Awesome Leaflet marker
const highlightedIcon = L.divIcon({
  className: 'custom-marker-icon', // Custom CSS class to style the marker
  html: '<i class="fas fa-map-marker-alt" style="font-size: 30px; color: #4e438c;"></i>', // Font Awesome marker icon in blue
  iconSize: [25, 45], // Larger size for the highlighted marker
  iconAnchor: [12.5, 45], // Point of the icon that corresponds to marker's location
  popupAnchor: [0, -45] // Position of the popup relative to the icon
});


// Define category icons with their respective colors
const categoryIcons = {
  'Concentrates': { icon: 'fas fa-vial', color: '#365fa6' },
  'Edibles': { icon: 'fas fa-cookie-bite', color: '#3cc5ab' },
  'Flower': { icon: 'fas fa-leaf', color: '#2ca0c3' },
  'Pre-Rolls': { icon: 'fas fa-smoking', color: '#43dd9a' },
  'Salves & Balms': { icon: 'fas fa-hand-holding-water', color: '#54c594' },
  'Tinctures': { icon: 'fas fa-tint', color: '#7bdb5c' },
  'Vapes & Vape Cartridges': { icon: 'fas fa-smoking', color: '#365fa6' }
};

// Function to render the icon in the grid
const renderCategoryIcon = (category) => {
  const icon = categoryIcons[category];
  if (!icon) return null;
  return <i className={icon.icon} style={{ color: icon.color, fontSize: '20px' }} />;
};



const Dashboard = () => {
  const mapRef = useRef(null);
  const geocoderContainer = useRef(null); // Reference to the geocoder container
  const locationsData = locations.features;
  const dealsData = deals;

  // State to hold the selected category from dropdown mennu
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // For search input

  // State to track the selected row location and highlight it on the map
  const [selectedLocation, setSelectedLocation] = useState(null);

  // JavaScript code to link geocoder with map, ensure map ref is set correctly.
  useEffect(() => {
    if (geocoderContainer.current && !geocoderContainer.current.hasChildNodes()) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        placeholder: 'Search for city...',
        mapboxgl: mapboxgl,
        marker: false,  // Disable the default marker
      });

      // Append the geocoder only if it hasn't been appended already
      geocoderContainer.current.appendChild(geocoder.onAdd());

      // On geocoder result, zoom to the location
      geocoder.on('result', (e) => {
        const [lng, lat] = e.result.center;
        setSelectedLocation({ lat, lng });

        // Move map to selected location
        if (mapRef.current) {
          const map = mapRef.current;
          map.flyTo([lat, lng], 8); // Zoom to the result
        }
      });
    }
  }, []);



  // DataGrid columns definition
  // const columns = [
  //   {
  //     field: 'CategoryIcon',
  //     headerName: '',
  //     width: 50,
  //     renderCell: (params) => <i className="fas fa-vial" style={{ color: '#365fa6', fontSize: '20px' }} />,
  //   },
  //   { field: 'Deal', headerName: 'Deal', width: 200, flex: 1, }, // Dynamic width with flex
  //   { field: 'Location', headerName: 'Location', width: 120, flex: 0.5 }, // Dynamic width
  //   { field: 'Price', headerName: 'Price', width: 120, flex: 0.5, }, // Dynamic width
  // ];

  // DataGrid columns definition
  const columns = [
    {
      field: 'CategoryIcon',
      headerName: '',
      width: 50,
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          {renderCategoryIcon(params.row.Category)}
        </div>
      ),
    },
    {
      field: 'Deal',
      headerName: 'Deal',
      width: 300,
      flex: 1,
      renderCell: (params) => (
        <div
          style={{
            display: 'flex',
            flex: '1',
            alignItems: 'center',
            justifyContent: 'flex-start',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            lineHeight: '1',
            minHeight: '60px',
            padding: '5px',
            height: '100%',
          }}
        >
          {params.row.Deal}
        </div>
      ),
    },
    {
      field: 'Location',
      headerName: 'Location',
      width: 120,
      flex: 0.4,
      renderCell: (params) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            lineHeight: '1',
            minHeight: '60px',
            padding: '5px',
            height: '100%',
          }}
        >
          {params.row.Location}
        </div>
      ),
    },
    {
      field: 'Price',
      headerName: 'Price',
      width: 120,
      flex: 0.3,

      renderCell: (params) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            lineHeight: '1',
            minHeight: '60px',
            padding: '5px',
            height: '100%',
          }}
        >
          {params.row.Price}
        </div>
      ),
    },
  ];

  // Add unique IDs to the deals data for the DataGrid
  const filteredDeals = dealsData.filter((deal) =>
    (selectedCategory === '' || deal.Category === selectedCategory) &&
    (searchTerm === '' || deal.Deal.toLowerCase().includes(searchTerm.toLowerCase()) || deal.Category.toLowerCase().includes(searchTerm.toLowerCase()) || deal.Location.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const rows = filteredDeals.map((deal, index) => ({ id: index, ...deal }));

  // Handle category change
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Adjust this function if the marker is still not centered properly
  const handleRowClick = (params) => {
    const selectedDeal = params.row;
    const selectedLocationData = locationsData.find(location => location.properties.Location === selectedDeal.Location);

    if (selectedLocationData) {
      const [lng, lat] = selectedLocationData.geometry.coordinates;
      setSelectedLocation({ lat, lng });

      if (mapRef.current) {
        const map = mapRef.current;
        map.setView([lat, lng], 12); // Adjust the zoom and animate the movement
      }
    }
  };

  const HomeButton = () => {
    const map = useMap();

    useEffect(() => {
      const homeControl = L.control({ position: 'topright' });

      homeControl.onAdd = () => {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.innerHTML = `
          <button style="
            background-color: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            font-size: 12px;
            border: none;
            cursor: pointer;
          ">
            <i class="fas fa-home"></i>  <!-- Font Awesome Home Icon -->
          </button>
        `;
        div.style.cursor = 'pointer';

        div.onclick = function () {
          map.setView([41.8690479, -71.1649791999999], 8); // Zoom back to the initial center and zoom level
          setSelectedLocation(null);
        };
        return div;
      };

      homeControl.addTo(map);

      return () => {
        map.removeControl(homeControl);
      };
    }, [map]);

    return null;
  };



  return (
    <div>
      {/* Header */}
      <header className="app-header">
        <img src={logo} alt="Logo" className="logo" />

        {/* Search bar */}
        <div className="search-bar">
          <div className="category-search">
            <span className="search-icon">
              <i className="fas fa-map-marker-alt" ></i>
            </span>
            <input
              type="text"
              placeholder="Concentrates, edibles, ..."
              onChange={handleSearchChange} // Handle search input change
            />

          </div>

          {/* Geocoder search input */}
          <div className="location-search" >
            <div className="geocoder" ref={geocoderContainer}>

            </div>
          </div>
        </div>

        <div>
          {/* Filter Dropdown */}
          <div className="filter">
            <FormControl
              className="filter-control"
              size="small"
              sx={{
                width: '150px', // Default width for larger screens
                '& .MuiOutlinedInput-root': {
                  height: '30px', // Set height
                  fontSize: '0.8rem', // Adjust font size
                  padding: '0px', // Adjust padding for height consistency
                },
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%', // Ensure it takes full height
                  padding: '0 10px', // Optional: padding to keep some space
                },
                // Responsive Media Queries
                '@media (max-width: 1024px)': {
                  width: '130px', // Adjust width for tablets
                  '& .MuiOutlinedInput-root': {
                    height: '28px', // Slightly smaller height
                    fontSize: '0.75rem', // Smaller font for tablets
                  },
                },
                '@media (max-width: 768px)': {
                  width: '120px', // Narrower on mobile
                  '& .MuiOutlinedInput-root': {
                    height: '26px',
                    fontSize: '0.7rem',
                  },
                },
                '@media (max-width: 480px)': {
                  width: '100px', // Even smaller for very small screens
                  '& .MuiOutlinedInput-root': {
                    height: '24px',
                    fontSize: '0.6rem',
                  },
                },
              }}
            >
              <InputLabel sx={{ fontSize: '0.7rem', color: '#54c594', textAlign: 'center' }}>Filter by Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Filter by Category"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root': {
                        fontSize: '0.9rem', // Default size for the dropdown items
                        padding: '8px 16px', // Default padding
                      },
                      // Responsive styling for dropdown menu
                      '@media (max-width: 1024px)': {
                        '& .MuiMenuItem-root': {
                          fontSize: '0.8rem',
                          padding: '4px 8px',
                        },
                      },
                      '@media (max-width: 768px)': {
                        '& .MuiMenuItem-root': {
                          fontSize: '0.7rem',
                          padding: '4px 8px',
                        },
                      },
                      '@media (max-width: 480px)': {
                        '& .MuiMenuItem-root': {
                          fontSize: '0.6rem',
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <i className="fas fa-globe" style={{ marginRight: '10px', fontSize: '0.7rem', color: '#7bdb5c' }}></i>
                  All Categories
                </MenuItem>
                {Object.keys(categoryIcons).map((category) => (
                  <MenuItem key={category} value={category}>
                    <i className={categoryIcons[category].icon} style={{ marginRight: '10px', fontSize: '0.8rem', color: categoryIcons[category].color }}></i>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

          </div>
        </div>
      </header>




      {/* Dashboard Container */}
      <div className="dashboard-container">


        {/* Grid */}
        <div className="grid">
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={[5]} // Controls how many rows per page
            rowHeight={80}
            disableColumnMenu
            onRowClick={handleRowClick}
            className='grid-container'
            sx={{
              // DataGrid root styles
              fontFamily: "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
              fontSize: '0.9rem', // Default font size for larger screens
              backgroundColor: 'white',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)', // Light shadow
              borderRadius: '8px',
              overflow: 'hidden',
              border: 'none',
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid #ddd',
                backgroundColor: 'white',
                position: 'sticky',
                zIndex: 99, // Ensures it stays on top
                padding:0,
              },
              '& .MuiDataGrid-columnHeaders': {
                color: '#54c594',
                fontWeight: 'bold',
              },
              // Remove blue border on cell focus
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
                border: 'none',
              },


              // Responsive Media Queries
              '@media (max-width: 1024px)': {
                fontSize: '0.8rem', // Slightly smaller font for tablets
                rowHeight: 80, // Adjust row height for tablets
              },
              '@media (max-width: 768px)': {
                fontSize: '0.7rem', // Even smaller font for mobile screens
                rowHeight: 80, // Reduce row height for mobile
              },
              '@media (max-width: 480px)': {
                fontSize: '0.6rem', // Smallest font for very small screens
                rowHeight: 70, // Reduce row height further
              },
            }}
          />
        </div>

        {/* Map */}
        <div className="map">
          <MapContainer
            ref={mapRef}
            className="map-container"  // Removed inline style and using the class instead
            center={[41.8690479, -71.1649791999999]} // Centered at the first location
            zoom={9}
          >
            <TileLayer
              url="https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYnVkdG5kZXIiLCJhIjoiY20xZmUwYW43MjZvYjJxb2FzY3gxdGR4cCJ9.7BY51LXeOKEHES9pYbBV3A"
              attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a> contributors'
            />

            {/* Markers */}
            {locationsData.map((location, index) => (
              <Marker
                key={index}
                position={[
                  location.geometry.coordinates[1], // Latitude
                  location.geometry.coordinates[0], // Longitude
                ]}
                icon={
                  selectedLocation &&
                    selectedLocation.lat === location.geometry.coordinates[1] &&
                    selectedLocation.lng === location.geometry.coordinates[0]
                    ? highlightedIcon
                    : defaultIcon
                } // Highlight the selected marker
              >
                <Popup>
                  <div className="popup-container">
                    <h3 className="popup-title">{location.properties.Location}</h3>
                    <p className="popup-address">{location.properties.Address}</p>
                    {location.properties.Website !== "NaN" ? (
                      <a
                        href={location.properties.Website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="popup-website"
                      >
                        Visit Website
                      </a>
                    ) : (
                      <span className="popup-no-website">No website available</span>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Custom Home Button */}
            <HomeButton />
          </MapContainer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
