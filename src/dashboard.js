import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { DataGrid } from '@mui/x-data-grid'; // Import MUI DataGrid
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'; // Import MUI Select and related components
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import Pagination from '@mui/material/Pagination'; // Import MUI Pagination


import logo from './assets/transparent_cropped_logo.png';
import locations from './assets/locations.json';
import deals from './assets/deals.json';

import '@fortawesome/fontawesome-free/css/all.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './dashboard.css';
import customIconImage from './assets/icononly_transparent_nobuffer.png';

mapboxgl.accessToken = 'pk.eyJ1IjoiYnVkdG5kZXIiLCJhIjoiY20xZmUwYW43MjZvYjJxb2FzY3gxdGR4cCJ9.7BY51LXeOKEHES9pYbBV3A';




const defaultIcon = L.icon({
  iconUrl: customIconImage, // Path to your custom image
  iconSize: [20, 20], // Reduce the size to make it look more pleasant
  iconAnchor: [10, 20], // Adjust the anchor point to the bottom center
  popupAnchor: [0, -20] // Adjust popup position to appear above the marker
});

// Highlighted marker icon using the custom image with Leaflet's default shadow
const highlightedIcon = L.icon({
  iconUrl: customIconImage, // Path to your custom image
  iconSize: [25, 25], // Larger size for highlighted marker but still subtle
  iconAnchor: [12.5, 25], // Adjust the anchor point for highlighted icon
  popupAnchor: [0, -25] // Adjust popup position to appear above the highlighted marker
});


// Define category icons with their respective colors
const categoryIcons = {
  'Extracts': {
    icon: 'fas fa-vial',
    color: '#365fa6'  // GoldenRod color to represent extracts like oils or concentrates
  },
  'Edibles': {
    icon: 'fas fa-cookie-bite',
    color: '#8B4513'  // SaddleBrown for a chocolate cookie color
  },
  'Flower': {
    icon: 'fas fa-leaf',
    color: '#228B22'  // ForestGreen to represent cannabis flower
  },
  'Pre-Rolls': {
    icon: 'fas fa-smoking',
    color: '#43dd9a'  // Sienna for a tobacco-like, earthy look for pre-rolls
  },
  'Topicals': {
    icon: 'fas fa-hand-holding-water',
    color: '#4682B4'  // SteelBlue for soothing and medicinal topicals like creams
  },
  'Tinctures': {
    icon: 'fas fa-tint',
    color: '#6A5ACD'  // SlateBlue for tinctures, representing liquid drops
  },
  'Vapes & Vape Cartridges': {
    icon: 'fas fa-smoking',
    color: '#708090'  // SlateGray to resemble vape pens and cartridges
  },
  'Drinks': {
    icon: 'fas fa-glass-martini-alt',
    color: '#1E90FF'  // DodgerBlue to represent beverages and drinks
  },
  'Accessories': {
    icon: 'fas fa-tshirt',
    color: '#D2691E'  // Chocolate color representing accessories or boxes of items
  },
  'Featured Deals': {
    icon: 'fas fa-gift',
    color: '#FF4500'  // OrangeRed color to highlight special or featured deals
  }
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
  const gridRef = useRef(null); // Create a reference for the DataGrid API
  const locationsData = locations.features;
  const dealsData = deals;

  // State to hold the selected category from dropdown mennu
  const [selectedCategory, setSelectedCategory] = useState('');

  // State to track the selected row location and highlight it on the map
  const [selectedLocation, setSelectedLocation] = useState(null);

  const selectedMarkerRef = useRef(null);

  // Custom Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(0);

  const [sortModel, setSortModel] = useState([{ field: 'Location', sort: 'asc' }]);

  // Function to handle sorting based on column and direction
  const getSortedRows = (rows, sortModel) => {
    if (!sortModel.length) return rows;
    const { field, sort } = sortModel[0];

    return rows.slice().sort((a, b) => {
      const aValue = a[field] ? a[field].toString().toLowerCase() : '';
      const bValue = b[field] ? b[field].toString().toLowerCase() : '';

      if (aValue < bValue) return sort === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort === 'asc' ? 1 : -1;
      return 0;
    });
  };

  

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
            textOverflow: 'ellipsis'
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
    (selectedCategory === '' || deal.Category === selectedCategory)
  );

  const sortedDeals = getSortedRows(filteredDeals, sortModel);

  // Pagination: Calculate rows for the current page
  const currentPageDeals = sortedDeals.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const rows = currentPageDeals.map((deal, index) => ({
    id: index + (page - 1) * pageSize,
    ...deal,
  }));



  // Handling page change
  const handlePageChange = (event, value) => {
    const totalPages = Math.ceil(filteredDeals.length / pageSize);
  
  // If the new page exceeds the total pages, reset to the last available page
  const newPage = value > totalPages ? totalPages : value;
    setPage(value);
    // Scroll the DataGrid to the top row after the page changes
    if (gridRef.current) {
      const gridWindow = gridRef.current.querySelector('.MuiDataGrid-virtualScroller'); // DataGrid's scrollable element
      gridWindow.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentPage(newPage - 1); 
  };

  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset to first page when page size changes
  };
  // Handle category change
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPage(1);  // Reset the page to 1
    setCurrentPage(0);  // Reset the DataGrid's currentPage to 0 if necessary
  };
  

  // Handle search input change
  // const handleSearchChange = (event) => {
  //   setSearchTerm(event.target.value);
  // };

  const handleRowClick = (params) => {
    const selectedDeal = params.row;
    const selectedLocationData = locationsData.find(location => location.properties.Location === selectedDeal.Location);

    if (selectedLocationData) {
      const [lng, lat] = selectedLocationData.geometry.coordinates;
      setSelectedLocation({ lat, lng });

      if (mapRef.current) {
        const map = mapRef.current;

        // Move the map to the selected location and zoom in
        map.setView([lat, lng], 14, { animate: true });

        // Remove any existing markers before adding a new one
        if (selectedMarkerRef.current) {
          map.removeLayer(selectedMarkerRef.current);
        }

        // Create a new marker at the clicked location
        const newMarker = L.marker([lat, lng], { icon: highlightedIcon }).addTo(map);
        if (selectedLocationData) {
          const [lng, lat] = selectedLocationData.geometry.coordinates;
          setSelectedLocation({ lat, lng });

          if (mapRef.current) {
            const map = mapRef.current;
            map.setView([lat, lng], 12); // Adjust the zoom and animate the movement
          }
        }
        // Create the popup content dynamically
        const popupContent = `
        <div class="popup-container">
          <h3 class="popup-title">${selectedLocationData.properties.Location}</h3>
          <p class="popup-address">${selectedLocationData.properties.Address}</p>
          ${selectedLocationData.properties.Website !== 'NaN' ?
            `<a href="${selectedLocationData.properties.Website}" target="_blank" rel="noopener noreferrer" class="popup-website">
              Visit Website
            </a>` :
            `<span class="popup-no-website">No website available</span>`
          }
        </div>
      `;

        // Bind the popup to the new marker and open it
        newMarker.bindPopup(popupContent).openPopup();

        // Store the new marker in a ref for future removal
        selectedMarkerRef.current = newMarker;
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
          map.removeLayer(selectedMarkerRef.current);
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

        <div>
          {/* Filter Dropdown */}
          <div className="filter">
            <FormControl
              className="filter-control"
              size="small"
              sx={{
                width: '150px',
                '& .MuiOutlinedInput-root': {
                  height: '30px',
                  fontSize: '0.8rem',
                  padding: '0px',
                },
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  padding: '0 10px',
                },
                '@media (max-width: 1024px)': {
                  width: '130px',
                  '& .MuiOutlinedInput-root': {
                    height: '28px',
                    fontSize: '0.75rem',
                  },
                },
                '@media (max-width: 768px)': {
                  width: '100px',
                  '& .MuiOutlinedInput-root': {
                    height: '26px',
                    fontSize: '0.7rem',
                  },
                },
                '@media (max-width: 480px)': {
                  width: '100px',
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
                        fontSize: '0.9rem',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px', // Consistent gap between icon and text
                        lineHeight: '1.5', // Consistent line height for text alignment
                      },
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
                  <i className="fas fa-globe" style={{ minWidth: '20px', fontSize: '0.7rem', color: '#7bdb5c' }}></i>
                  <span>All Categories</span>
                </MenuItem>
                {Object.keys(categoryIcons).map((category) => (
                  <MenuItem key={category} value={category}>
                    <i
                      className={categoryIcons[category].icon}
                      style={{
                        minWidth: '20px', // Fixed width for the icons
                        fontSize: '0.8rem',
                        color: categoryIcons[category].color,
                      }}
                    ></i>
                    <span style={{ flexShrink: 0 }}>{category}</span> {/* Ensure no text wrapping */}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>




        <img src={logo} alt="Logo" className="logo" />

        {/* Search bar */}
        <div className="search-bar">
          {/* <div className="category-search">
            <span className="search-icon">
              <i className="fas fa-map-marker-alt" ></i>
            </span>
            <input
              type="text"
              placeholder="Extract, edibles, ..."
              onChange={handleSearchChange} // Handle search input change
            />

          </div> */}

          {/* Geocoder search input */}
          <div className="location-search" >
            <div className="geocoder" ref={geocoderContainer}>

            </div>
          </div>
        </div>

      </header>




      {/* Dashboard Container */}
      <div className="dashboard-container">


        {/* Grid */}
        <div className="grid" ref={gridRef} >
          <DataGrid
            rows={rows}
            columns={columns}
            rowHeight={100}
            pageSize={pageSize}
            disableColumnMenu
            onSortModelChange={handleSortModelChange}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRowClick={(params) => handleRowClick(params)}
            pagination
            paginationMode="server"
            rowCount={filteredDeals.length}  // Ensure this prop is added
            page={currentPage}
            className="grid-container"
            sx={{
              // DataGrid root styles
              fontFamily: "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
              fontSize: '0.9rem', // Default font size for larger screens
              backgroundColor: 'white',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)', // Light shadow
              borderRadius: '8px',
              overflow: 'hidden',
              border: 'none',
              paddingBottom: '70px',
              '& .MuiDataGrid-footerContainer': {
                display: 'none'
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
                rowHeight: 100, // Adjust row height for tablets
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

          {/* Sticky Pagination */}
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              zIndex: 100,
              backgroundColor: '#fff',
              padding: '10px 0',
              borderTop: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Pagination
              count={Math.ceil(filteredDeals.length / pageSize)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </div>
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
