import {useState, useEffect} from 'react'
import {Link, useParams} from 'react-router-dom'
import {getDoc, doc} from 'firebase/firestore'
import {db} from '../firebase.config'
import {getAuth} from 'firebase/auth'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import SwiperCore, {Navigation, Pagination, Scrollbar, A11y} from 'swiper'
import {Swiper, SwiperSlide} from 'swiper/react'
import 'swiper/swiper-bundle.css'
import Spinner from '../components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'
import {toast} from 'react-toastify'
SwiperCore.use([Navigation,Pagination,Scrollbar,A11y])

function Listing() {
    const [listing, setListing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)

    const params = useParams()
    const auth = getAuth()
    // console.log(123)

    useEffect(()=>{
        const fetchListing = async()=>{
            const docRef = doc(db, 'listings', params.listingId)
            const docSnap = await getDoc(docRef)

            if(docSnap.exists()){
                setListing(docSnap.data())
                setLoading(false)
            }else{
                toast.error('could not fetch the item')
            }
        }
        fetchListing()
    },[params.listingId])
    
    if(loading) return <Spinner/>
    
    
    return (
        <main>
            <Swiper slidesPerView={1} pagination={{clickable: true}}>
              {listing.imageUrls.map((url, index)=>(
                  <SwiperSlide key={index}>
                      <div className="swiperSlideDiv" style={{background: `url(${listing.imageUrls[index]}) center no-repeat`, backgroundSize: 'cover'}}></div>
                  </SwiperSlide>
              ))}  
            </Swiper>

            <div className="shareIconDiv" onClick={()=>{
                navigator.clipboard.writeText(window.location.href)
                setShareLinkCopied(true)
                setTimeout(()=>{setShareLinkCopied(false)},2000)
            }}><img src={shareIcon} alt="share" /></div>
            {shareLinkCopied && <p className='linkCopied'>Link Copied!</p>}
            <div className="listingDetails">
                <p className="listingName">{listing.name}-${
                    listing.offer ? listing.discountedPrice
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",") :
                     listing.regularPrice
                     .toString()
                     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }</p>
                <p className="listingLocation">{listing.location}</p>
                <p className="listingType">
                   For {listing.type ==='rent'?'Rent':'Sale'}
                </p>
                    {listing.offer && (
                        <p className="discountPrice">
                            ${listing.regularPrice-listing.discountedPrice} discount
                        </p>
                    )}
                <ul className="listingDetailsList">
                    <li>
                        {listing.bedrooms > 1
                        ? `${listing.bedrooms} Bedrooms`
                        : '1 Bedroom'}
                    </li>
                    <li>
                        {listing.bathrooms > 1
                        ? `${listing.bathrooms} Bathrooms`
                        : '1 Bathroom'}
                    </li>
                    <li>{listing.parking && 'Parking Spot'}</li>
                    <li>{listing.furnished && 'Furnished'}</li>
                </ul>

                <p className="listingLocationTitle">Location</p>
                
                <div className="leafletContainer">
                    <MapContainer style={{height: '100%', width: '100%'}} zoom={13} center={[listing.geolocation.lat,listing.geolocation.lng]} 
                    scrollWheelZoom={false}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[listing.geolocation.lat,listing.geolocation.lng]}>
                            <Popup>
                                {listing.location}
                            </Popup>
                        </Marker>
                    </MapContainer>
                    
                </div>

                {auth.currentUser?.uid !== listing.userRef && (
                    <Link to={`/contact/${listing.userRef}?listingName=${listing.name}`} 
                    className='primaryButton'>Contact Landlord</Link>
                )}
            </div>

        </main>
    )
}

export default Listing
