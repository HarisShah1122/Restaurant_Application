import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RestaurantCard from './RestaurantCard';
import LoadingSpinner from './LoadingSpinner';
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

const API_URL = 'http://localhost:8081/api';
const config = { jwtSecret: '8Kj9mPq2v' }; 

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
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) fetchRestaurants();
  }, [page, user, searchQuery]); 

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

  const fetchRestaurants = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/restaurants`, {
        params: { page, limit: 2, query: searchQuery }, 
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurants(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
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

    try {
      await axios.post(`${API_URL}/restaurants`, {
        ...newRestaurant,
        rating: parseFloat(newRestaurant.rating),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Restaurant added successfully');
      fetchRestaurants();
      setNewRestaurant({ name: '', cuisine: '', location: '', rating: '', images: [] });
      setShowModal(false);
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error saving restaurant:', error);
      setError(error.message || 'Failed to add restaurant');
    } finally {
      setFormLoading(false);
    }
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

    try {
      await axios.put(`${API_URL}/restaurants/${selectedRestaurant.id}`, {
        ...selectedRestaurant,
        rating: parseFloat(selectedRestaurant.rating),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Restaurant updated successfully');
      fetchRestaurants();
      setSelectedRestaurant(null);
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error updating restaurant:', error);
      setError(error.message || 'Failed to update restaurant');
    } finally {
      setFormLoading(false);
    }
  };

  const deleteRestaurant = async (id) => {
    if (!user) return navigate('/login');
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/restaurants/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Restaurant deleted successfully');
      fetchRestaurants();
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      setError(error.message || 'Failed to delete restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) setPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const openModal = (restaurant) => {
    setModalData(restaurant);
    setShowModal(true);
  };

  const handleAction = (action) => {
    if (action === 'close') setShowModal(false);
  };

  if (loading) return <LoadingSpinner />;

  // Featured Restaurant Data for Modal
  const featuredRestaurant = {
    name: 'Peshawar Tikka',
    cuisine: 'Tikka',
    location: 'Peshawar',
    rating: 4.7,
    description: 'Specializes in juicy Tikka with traditional charcoal grilling.',
    priceRange: '$$$',
    contact: '+92-333-4567890',
    openingHours: '12:00 PM - 12:00 AM',
    menu: ['Chicken Tikka', 'Beef Tikka', 'Mutton Tikka'],
    images: ['/images/peshawarTikka.jpg'],
    reviews: [
      { user: 'Hassan', rating: 4.7, comment: 'Perfect Tikka experience!' },
      { user: 'Fatima', rating: 4.6, comment: 'Highly recommended.' }
    ]
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Restaurants</strong>
            <CButton color="primary" onClick={() => setShowModal(true)}>
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

          {/* Navigation/Filter Section */}
          <div className="mb-4">
            <div className="row g-2">
              <div className="col-md-4">
                <CFormSelect aria-label="All Cuisines">
                  <option>All Cuisines</option>
                  {/* Add cuisine options dynamically if needed */}
                </CFormSelect>
              </div>
              <div className="col-md-4">
                <CFormSelect aria-label="All Locations">
                  <option>All Locations</option>
                  {/* Add location options dynamically if needed */}
                </CFormSelect>
              </div>
              <div className="col-md-4">
                <CFormSelect aria-label="All Ratings">
                  <option>All Ratings</option>
                  {/* Add rating options dynamically if needed */}
                </CFormSelect>
              </div>
            </div>
          </div>

          {/* Modal Option after Navigation/Filter Section */}
          <div className="text-center mb-4">
            <CButton color="info" onClick={() => openModal(featuredRestaurant)}>View Details</CButton>
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
          <CModal visible={showModal && !modalData} onClose={() => setShowModal(false)}>
            <CModalHeader>
              <CModalTitle>Add New Restaurant</CModalTitle>
              <CDropdown alignment="end">
                <CDropdownToggle
                  color="secondary"
                  caret={false}
                  style={{ padding: '6px 12px' }}
                >
                  <span style={{ fontSize: '24px', cursor: 'pointer' }}>⋯</span>
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={() => handleAction('close')}>Close</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
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
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setShowModal(false)} disabled={formLoading}>
                Cancel
              </CButton>
              <CButton color="primary" onClick={saveRestaurant} disabled={formLoading}>
                Save
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Edit Restaurant Form */}
          <CModal visible={!!selectedRestaurant} onClose={() => setSelectedRestaurant(null)}>
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
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setSelectedRestaurant(null)} disabled={formLoading}>
                Cancel
              </CButton>
              <CButton color="primary" onClick={updateRestaurant} disabled={formLoading}>
                Update
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Details Modal */}
          <CModal visible={showModal && modalData} onClose={() => setShowModal(false)}>
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
              <CButton color="secondary" onClick={() => setShowModal(false)}>Close</CButton>
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