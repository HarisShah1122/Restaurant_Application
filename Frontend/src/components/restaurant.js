import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CButton,
  CAlert,
  CForm,
  CFormInput,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import { cilPlus } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { searchRestaurants } from './api';
import LoadingSpinner from './LoadingSpinner'; // Ensure this component exists

const API_URL = 'http://localhost:8081/api';

function Restaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRestaurant, setNewRestaurant] = useState({ name: '', cuisine: '', location: '', rating: '', images: [] });
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [initialRestaurants, setInitialRestaurants] = useState([
    { id: 1, name: 'Karachi Biryani House', cuisine: 'Biryani', location: 'Karachi', rating: 4.5, images: ['/images/karachispice.jpg'], description: 'A renowned spot for authentic Biryani.', priceRange: '$$$', contact: '+92-321-1234567', openingHours: '10:00 AM - 11:00 PM', menu: ['Chicken Biryani', 'Mutton Biryani'], reviews: [{ user: 'Ali', rating: 4.5, comment: 'Best Biryani!' }] },
    { id: 2, name: 'Karachi Karahi Delight', cuisine: 'Karahi', location: 'Karachi', rating: 4.3, images: ['/images/karachispice.jpg'], description: 'Famous for sizzling Karahi.', priceRange: '$$', contact: '+92-321-7654321', openingHours: '11:00 AM - 10:00 PM', menu: ['Chicken Karahi'], reviews: [{ user: 'Ahmed', rating: 4.3, comment: 'Love the spices!' }] },
    { id: 3, name: 'Karachi Tikka Palace', cuisine: 'Tikka', location: 'Karachi', rating: 4.6, images: ['/images/karachispice.jpg'], description: 'Juicy Tikka with charcoal grilling.', priceRange: '$$$', contact: '+92-321-4567890', openingHours: '12:00 PM - 11:00 PM', menu: ['Chicken Tikka'], reviews: [{ user: 'Hassan', rating: 4.6, comment: 'Excellent Tikka!' }] },
    { id: 4, name: 'Karachi Nihari Corner', cuisine: 'Nihari', location: 'Karachi', rating: 4.2, images: ['/images/karachispice.jpg'], description: 'Slow-cooked Nihari with rich flavors.', priceRange: '$$', contact: '+92-321-9876543', openingHours: '9:00 AM - 9:00 PM', menu: ['Beef Nihari'], reviews: [{ user: 'Omar', rating: 4.2, comment: 'Tasty!' }] },
    { id: 5, name: 'Karachi Haleem House', cuisine: 'Haleem', location: 'Karachi', rating: 4.4, images: ['/images/karachiHaleem.jpg'], description: 'Specializes in rich and creamy Haleem.', priceRange: '$$', contact: '+92-321-5555555', openingHours: '9:00 AM - 10:00 PM', menu: ['Chicken Haleem'], reviews: [{ user: 'Khalid', rating: 4.4, comment: 'Best Haleem!' }] },
    { id: 6, name: 'Lahore Biryani Haven', cuisine: 'Biryani', location: 'Lahore', rating: 4.4, images: ['/images/lahoreGrill.jpg'], description: 'Flavorful Biryani with a local twist.', priceRange: '$$$', contact: '+92-322-1234567', openingHours: '10:00 AM - 11:00 PM', menu: ['Chicken Biryani'], reviews: [{ user: 'Ali', rating: 4.4, comment: 'Amazing flavors!' }] },
    { id: 7, name: 'Lahore Karahi Spot', cuisine: 'Karahi', location: 'Lahore', rating: 4.5, images: ['/images/lahoreGrill.jpg'], description: 'Sizzling Karahi with authentic spices.', priceRange: '$$', contact: '+92-322-7654321', openingHours: '11:00 AM - 10:00 PM', menu: ['Chicken Karahi'], reviews: [{ user: 'Ahmed', rating: 4.5, comment: 'Best Karahi!' }] },
    { id: 8, name: 'Lahore Tikka House', cuisine: 'Tikka', location: 'Lahore', rating: 4.7, images: ['/images/lahoreGrill.jpg'], description: 'Tikka grilled to perfection.', priceRange: '$$$', contact: '+92-322-4567890', openingHours: '12:00 PM - 11:00 PM', menu: ['Chicken Tikka'], reviews: [{ user: 'Hassan', rating: 4.7, comment: 'Perfect Tikka!' }] },
    { id: 9, name: 'Lahore Nihari Place', cuisine: 'Nihari', location: 'Lahore', rating: 4.1, images: ['/images/lahoreGrill.jpg'], description: 'Rich Nihari with a Lahori touch.', priceRange: '$$', contact: '+92-322-9876543', openingHours: '9:00 AM - 9:00 PM', menu: ['Beef Nihari'], reviews: [{ user: 'Omar', rating: 4.1, comment: 'Good flavor.' }] },
    { id: 10, name: 'Islamabad Biryani Garden', cuisine: 'Biryani', location: 'Islamabad', rating: 4.3, images: ['/images/islamabadDelight.jpg'], description: 'Authentic Biryani with a modern twist.', priceRange: '$$$', contact: '+92-334-1234567', openingHours: '10:00 AM - 11:00 PM', menu: ['Chicken Biryani'], reviews: [{ user: 'Ali', rating: 4.3, comment: 'Delicious!' }] },
    { id: 11, name: 'Islamabad Karahi Hub', cuisine: 'Karahi', location: 'Islamabad', rating: 4.4, images: ['/images/islamabadDelight.jpg'], description: 'Sizzling Karahi with fresh ingredients.', priceRange: '$$', contact: '+92-334-7654321', openingHours: '11:00 AM - 10:00 PM', menu: ['Chicken Karahi'], reviews: [{ user: 'Ahmed', rating: 4.4, comment: 'Excellent spices!' }] },
    { id: 12, name: 'Islamabad Tikka Corner', cuisine: 'Tikka', location: 'Islamabad', rating: 4.6, images: ['/images/islamabadDelight.jpg'], description: 'Tikka with traditional methods.', priceRange: '$$$', contact: '+92-334-4567890', openingHours: '12:00 PM - 11:00 PM', menu: ['Chicken Tikka'], reviews: [{ user: 'Hassan', rating: 4.6, comment: 'Best Tikka!' }] },
    { id: 13, name: 'Islamabad Nihari Spot', cuisine: 'Nihari', location: 'Islamabad', rating: 4.2, images: ['/images/islamabadDelight.jpg'], description: 'Slow-cooked Nihari with rich flavors.', priceRange: '$$', contact: '+92-334-9876543', openingHours: '9:00 AM - 9:00 PM', menu: ['Beef Nihari'], reviews: [{ user: 'Omar', rating: 4.2, comment: 'Tasty!' }] },
    { id: 14, name: 'Peshawar Biryani Place', cuisine: 'Biryani', location: 'Peshawar', rating: 4.6, images: ['/images/peshawarTikka.jpg'], description: 'Flavorful Biryani with a Peshawari twist.', priceRange: '$$$', contact: '+92-333-1234567', openingHours: '10:00 AM - 11:00 PM', menu: ['Chicken Biryani'], reviews: [{ user: 'Ali', rating: 4.6, comment: 'Amazing taste!' }] },
    { id: 15, name: 'Peshawar Karahi House', cuisine: 'Karahi', location: 'Peshawar', rating: 4.5, images: ['/images/peshawarTikka.jpg'], description: 'Authentic Karahi with fresh spices.', priceRange: '$$', contact: '+92-333-7654321', openingHours: '11:00 AM - 10:00 PM', menu: ['Chicken Karahi'], reviews: [{ user: 'Ahmed', rating: 4.5, comment: 'Love it!' }] },
    { id: 16, name: 'Peshawar Tikka Haven', cuisine: 'Tikka', location: 'Peshawar', rating: 4.7, images: ['/images/peshawarTikka.jpg'], description: 'Specializes in juicy Tikka with traditional charcoal grilling.', priceRange: '$$$', contact: '+92-333-4567890', openingHours: '12:00 PM - 12:00 AM', menu: ['Chicken Tikka'], reviews: [{ user: 'Hassan', rating: 4.7, comment: 'Perfect Tikka experience!' }] },
    { id: 17, name: 'Peshawar Nihari Delight', cuisine: 'Nihari', location: 'Peshawar', rating: 4.3, images: ['/images/peshawarTikka.jpg'], description: 'Rich and slow-cooked Nihari with a Peshawari touch.', priceRange: '$$', contact: '+92-333-9876543', openingHours: '9:00 AM - 9:00 PM', menu: ['Beef Nihari'], reviews: [{ user: 'Omar', rating: 4.3, comment: 'Delicious!' }] },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    setRestaurants(initialRestaurants);
    setTotalPages(Math.ceil(initialRestaurants.length / 2));
  }, []);

  const fetchRestaurants = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const filters = { page, limit: 2 };
      if (searchQuery) {
        const results = await searchRestaurants(searchQuery, filters);
        setRestaurants(results);
        setTotalPages(Math.ceil(results.length / 2));
      } else {
        const paginated = initialRestaurants.slice((page - 1) * 2, page * 2);
        setRestaurants(paginated);
        setTotalPages(Math.ceil(initialRestaurants.length / 2));
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/check-auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
      setToken('');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.get(`${API_URL}/logout`, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.removeItem('token');
      setToken('');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRestaurant(prev => ({ ...prev, [name]: value }));
    if (selectedRestaurant) setSelectedRestaurant(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 30);
    const imagePaths = files.map(file => `/images/${(selectedRestaurant ? selectedRestaurant.name : newRestaurant.name).toLowerCase()}_${file.name}`);
    if (selectedRestaurant) setSelectedRestaurant(prev => ({ ...prev, images: imagePaths }));
    else setNewRestaurant(prev => ({ ...prev, images: imagePaths }));
  };

  const saveRestaurant = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setFormLoading(true);
    setError(null);
    setSuccess(null);

    if (!newRestaurant.name || !newRestaurant.cuisine || !newRestaurant.location || !newRestaurant.rating) {
      setError('Name, Cuisine, Location, and Rating are required');
      setFormLoading(false);
      return;
    }

    const newId = initialRestaurants.length + 1;
    const newRestaurantData = { id: newId, ...newRestaurant, rating: parseFloat(newRestaurant.rating), images: newRestaurant.images, description: '', priceRange: '', contact: '', openingHours: '', menu: [], reviews: [] };
    setRestaurants(prev => [...prev, newRestaurantData]);
    setInitialRestaurants(prev => [...prev, newRestaurantData]);
    setSuccess('Restaurant added successfully');
    setNewRestaurant({ name: '', cuisine: '', location: '', rating: '', images: [] });
    setShowModal(false);
    setTotalPages(Math.ceil((initialRestaurants.length + 1) / 2));
    setTimeout(() => setSuccess(null), 5000);
    setFormLoading(false);
  };

  const updateRestaurant = async (e) => {
    e.preventDefault();
    if (!user || !selectedRestaurant) return;
    setFormLoading(true);
    setError(null);
    setSuccess(null);

    if (!selectedRestaurant.name || !selectedRestaurant.cuisine || !selectedRestaurant.location || !selectedRestaurant.rating) {
      setError('Name, Cuisine, Location, and Rating are required');
      setFormLoading(false);
      return;
    }

    const updatedRestaurants = restaurants.map(r => r.id === selectedRestaurant.id ? { ...selectedRestaurant, rating: parseFloat(selectedRestaurant.rating) } : r);
    setRestaurants(updatedRestaurants);
    setInitialRestaurants(updatedRestaurants);
    setSuccess('Restaurant updated successfully');
    setSelectedRestaurant(null);
    setShowModal(false);
    setTimeout(() => setSuccess(null), 5000);
    setFormLoading(false);
  };

  const deleteRestaurant = async (id) => {
    if (!user) return navigate('/login');
    setLoading(true);
    const updatedRestaurants = restaurants.filter(r => r.id !== id);
    setRestaurants(updatedRestaurants);
    setInitialRestaurants(updatedRestaurants);
    setTotalPages(Math.ceil(updatedRestaurants.length / 2));
    setSuccess('Restaurant deleted successfully');
    setTimeout(() => setSuccess(null), 5000);
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) setPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
    fetchRestaurants();
  };

  const openModal = (restaurant) => {
    console.log('Opening modal for:', restaurant?.name); // Debug log
    setModalData(restaurant || null);
    setShowModal(true);
  };

  const handleAction = (action) => {
    console.log('Handling action:', action); // Debug log
    if (action === 'close') {
      setShowModal(false);
      setModalData(null);
      setSelectedRestaurant(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Debug: Log modal state
  console.log('showModal:', showModal, 'modalData:', modalData, 'selectedRestaurant:', selectedRestaurant);

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Restaurants</strong>
            <CButton color="primary" onClick={() => openModal(null)}>
              <CIcon icon={cilPlus} className="me-2" />
              Add Restaurant
            </CButton>
          </div>
          {success && (
            <CAlert
              color="success"
              className="mt-2 py-1 px-3"
              style={{
                fontSize: '0.9rem',
                lineHeight: '1.2',
                border: 'none',
                backgroundColor: '#d4edda',
                color: '#155724',
              }}
            >
              {success}
            </CAlert>
          )}
          {error && (
            <CAlert
              color="danger"
              className="mt-2 py-1 px-3"
              style={{
                fontSize: '0.9rem',
                lineHeight: '1.2',
                border: 'none',
                backgroundColor: '#f8d7da',
                color: '#721c24',
              }}
            >
              {error}
            </CAlert>
          )}
        </CCardHeader>
        <CCardBody>
          {/* Header */}
          <h2
            className="text-center mb-4 gradient-text animate__animated animate__fadeInDown"
            style={{
              fontWeight: 'bold',
              fontFamily: "'Roboto Slab', 'Arial Black', 'sans-serif'",
              background: 'linear-gradient(90deg, #ff416c, #ff4b2b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'fadeInDown 1.2s ease-in-out',
            }}
          >
            Desi Delights: Feast with Flavor!
          </h2>
          <p className="lead text-muted text-center">
            Savor authentic Pakistani cuisine {new Date().toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', second: '2-digit' })}, {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>

          {/* Search Input */}
          <div className="mb-4">
            <CFormInput
              type="text"
              placeholder="Search by restaurant name..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Navigation/Filter Section */}
          <div className="mb-4">
            <div className="row g-2">
              <div className="col-md-4">
                <CFormSelect aria-label="All Cuisines">
                  <option>All Cuisines</option>
                </CFormSelect>
              </div>
              <div className="col-md-4">
                <CFormSelect aria-label="All Locations">
                  <option>All Locations</option>
                </CFormSelect>
              </div>
              <div className="col-md-4">
                <CFormSelect aria-label="All Ratings">
                  <option>All Ratings</option>
                </CFormSelect>
              </div>
            </div>
          </div>

          {/* Modal Option after Navigation/Filter Section */}
          <div className="text-center mb-4">
            <CButton color="info" onClick={() => openModal(initialRestaurants.find(r => r.name === 'Peshawar Tikka Haven'))}>View Details</CButton>
          </div>

          {/* Restaurant List */}
          {loading ? (
            <CSpinner color="primary" />
          ) : (
            <CTable hover striped bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Cuisine</CTableHeaderCell>
                  <CTableHeaderCell>Location</CTableHeaderCell>
                  <CTableHeaderCell>Rating</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {restaurants.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="5" className="text-center">
                      No restaurants found for "{searchQuery}"
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  restaurants.map((restaurant) => (
                    <CTableRow key={restaurant.id}>
                      <CTableDataCell>{restaurant.name}</CTableDataCell>
                      <CTableDataCell>{restaurant.cuisine}</CTableDataCell>
                      <CTableDataCell>{restaurant.location}</CTableDataCell>
                      <CTableDataCell>{restaurant.rating} / 5</CTableDataCell>
                      <CTableDataCell>
                        <CDropdown alignment="end">
                          <CDropdownToggle
                            color="light"
                            caret={false}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#f1f1f1',
                              border: 'none',
                              borderRadius: '6px',
                            }}
                          >
                            <span style={{ fontSize: '24px', cursor: 'pointer' }}>⋯</span>
                          </CDropdownToggle>
                          <CDropdownMenu>
                            <CDropdownItem onClick={() => setSelectedRestaurant(restaurant)}>Edit</CDropdownItem>
                            <CDropdownItem onClick={() => openModal(restaurant)}>View Details</CDropdownItem>
                            <CDropdownItem onClick={() => deleteRestaurant(restaurant.id)}>Delete</CDropdownItem>
                          </CDropdownMenu>
                        </CDropdown>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          )}

          {/* Add Restaurant Modal */}
          <CModal visible={showModal && !modalData && !selectedRestaurant} onClose={() => handleAction('close')}>
            <CModalHeader>
              <CModalTitle>Add New Restaurant</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {error && <CAlert color="danger">{error}</CAlert>}
              {formLoading && <CSpinner color="primary" />}
              <CForm onSubmit={saveRestaurant}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Name</label>
                  <CFormInput
                    type="text"
                    name="name"
                    value={newRestaurant.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter restaurant name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Cuisine</label>
                  <CFormInput
                    type="text"
                    name="cuisine"
                    value={newRestaurant.cuisine}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter cuisine"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Location</label>
                  <CFormInput
                    type="text"
                    name="location"
                    value={newRestaurant.location}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter location"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Rating</label>
                  <CFormInput
                    type="number"
                    name="rating"
                    value={newRestaurant.rating}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter rating (0-5)"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Images</label>
                  <CFormInput
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    accept="image/png,image/jpeg"
                  />
                </div>
                <CButton color="primary" type="submit" disabled={formLoading}>Save</CButton>
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => handleAction('close')} disabled={formLoading}>Cancel</CButton>
            </CModalFooter>
          </CModal>

          {/* Edit Restaurant Modal */}
          <CModal visible={showModal && !!selectedRestaurant} onClose={() => handleAction('close')}>
            <CModalHeader>
              <CModalTitle>Edit Restaurant</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {error && <CAlert color="danger">{error}</CAlert>}
              {formLoading && <CSpinner color="primary" />}
              <CForm onSubmit={updateRestaurant}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Name</label>
                  <CFormInput
                    type="text"
                    name="name"
                    value={selectedRestaurant ? selectedRestaurant.name : ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter restaurant name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Cuisine</label>
                  <CFormInput
                    type="text"
                    name="cuisine"
                    value={selectedRestaurant ? selectedRestaurant.cuisine : ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter cuisine"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Location</label>
                  <CFormInput
                    type="text"
                    name="location"
                    value={selectedRestaurant ? selectedRestaurant.location : ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter location"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Rating</label>
                  <CFormInput
                    type="number"
                    name="rating"
                    value={selectedRestaurant ? selectedRestaurant.rating : ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter rating (0-5)"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Images</label>
                  <CFormInput
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    accept="image/png,image/jpeg"
                  />
                </div>
                <CButton color="primary" type="submit" disabled={formLoading}>Update</CButton>
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => handleAction('close')} disabled={formLoading}>Cancel</CButton>
            </CModalFooter>
          </CModal>

          {/* Details Modal */}
          <CModal visible={showModal && modalData && !selectedRestaurant} onClose={() => handleAction('close')}>
            <CModalHeader>
              <CModalTitle>{modalData?.name}</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <div className="row">
                <div className="col-md-6">
                  <img
                    src={modalData?.images[0] || '/images/placeholder.png'}
                    alt={`${modalData?.name} Image 1`}
                    className="img-fluid"
                    style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px' }}
                    onError={(e) => (e.target.src = '/images/placeholder.png')}
                  />
                </div>
                <div className="col-md-6">
                  <p><strong>Cuisine:</strong> {modalData?.cuisine}</p>
                  <p><strong>Location:</strong> {modalData?.location}</p>
                  <p><strong>Rating:</strong> {modalData?.rating} / 5</p>
                  <p><strong>Description:</strong> {modalData?.description}</p>
                  <p><strong>Price Range:</strong> {modalData?.priceRange}</p>
                  <p><strong>Contact:</strong> {modalData?.contact}</p>
                  <p><strong>Opening Hours:</strong> {modalData?.openingHours}</p>
                  <p><strong>Menu:</strong> {modalData?.menu.join(', ')}</p>
                  <div>
                    <strong>Reviews:</strong>
                    <ul>
                      {modalData?.reviews && modalData.reviews.map((review, index) => (
                        <li key={index}>
                          {review.user}: {review.rating} / 5 - "{review.comment}"
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => handleAction('close')}>Close</CButton>
            </CModalFooter>
          </CModal>

          {/* Pagination */}
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(page - 1)}>Previous</button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <li key={num} className={`page-item ${page === num ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(num)}>{num}</button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(page + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </CCardBody>
      </CCard>
    </CCol>
  );
}

export default Restaurant;