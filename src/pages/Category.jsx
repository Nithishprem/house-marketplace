import {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import {collection, getDocs, query, where, orderBy, limit,startAfter} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

function Category() {
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastFetchedListing, setLastFetchedListing] = useState(null)

    const params = useParams()

    useEffect(()=>{
        const fetchListings = async ()=>{
            try{
                //create a reference to listings
                const listingsRef = collection(db, 'listings')
                

                //create a query against the collection
                const q = query(listingsRef, 
                    where("type", "==", params.categoryName), 
                    orderBy("timestamp", "desc"), limit(2))
                
                //excute a query
                const querySnap = await getDocs(q)
                const lastVisible = querySnap.docs[querySnap.docs.length-1]
                setLastFetchedListing(lastVisible)
                const listings = []

                querySnap.forEach((doc)=>{
                    listings.push({
                      id: doc.id,
                      data: doc.data()
                    })
                })
                setListings(listings)
                setLoading(false)

            }catch(error){
                toast.error('Could not fetch listing')
            }
        }

        fetchListings()
    },[params.categoryName])
    

    //Load more for Pagination
    const onFetchMoreListings = async()=>{
        try{
            const listingsRef = collection(db, 'listings')
            const q = query(listingsRef, 
                where('type', '==', params.categoryName), 
                orderBy('timestamp', 'desc'), 
                startAfter(lastFetchedListing), 
                limit(2))          
    
            const querySnap = await getDocs(q)
            const lastVisible = querySnap.docs[querySnap.docs.length-1]
            setLastFetchedListing(lastVisible)
            
            const listings=[]

            querySnap.forEach((doc)=>{
                    listings.push({
                        id: doc.id,
                        data: doc.data()
                    })
                })
                setListings((prevState)=>[...prevState,...listings])
                setLoading(false)
        }catch(error){
            toast.error('could not fetch more listings')
        }
    }




    return (
        <div className='category'>
            <header className='pageHeader'>Places for {params.categoryName === 'rent'? 'rent': 'sale'}</header>
            {loading ? <Spinner/> : listings && listings.length>0 ?
            <>
            <main>
                <ul className="categoryListings">
                    {listings.map((listing)=>{
                        return <ListingItem key={listing.id} listing={listing.data} id={listing.id}/>
                    })}
                </ul>
            </main>
            <br />
            <br />
            {lastFetchedListing && (
                <p className="loadMore" onClick={onFetchMoreListings}>Load More</p>
            )}
            </> :
            <p>No listings for {params.categoryName}</p>}
        </div>
    )
}

export default Category
