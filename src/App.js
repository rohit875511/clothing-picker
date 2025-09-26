import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import imageCompression from "browser-image-compression";

function App() {
  const [clothes, setClothes] = useState([]);
  const [file, setFile] = useState(null);
  const [type, setType] = useState("");
  const [occasion, setOccasion] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterOccasion, setFilterOccasion] = useState("");
  const [leastWornList, setLeastWornList] = useState([]);
  const [mostPopularList, setMostPopularList] = useState([]);

 const types = ["T-Shirt", "Shirts", "Jackets", "Hoodies", "Pants", "Shorts", "Shoes"];
const occasions = ["Chill", "Going Out"];

  // Fetch clothes from Firestore
  const fetchClothes = async () => {
    try {
      let q = collection(db, "clothes");
      const conditions = [];
      if (filterType) conditions.push(where("type", "==", filterType));
      if (filterOccasion) conditions.push(where("occasion", "==", filterOccasion));
      if (conditions.length > 0) q = query(collection(db, "clothes"), ...conditions);

      const snapshot = await getDocs(q);
      setClothes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching clothes:", err);
    }
  };

  useEffect(() => {
    fetchClothes();
  }, [filterType, filterOccasion]);

  // Add clothing item with compression
  const handleAdd = async () => {
    if (!file || !type || !occasion) {
      alert("Select image, type, and occasion");
      return;
    }

    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 800 });
      const storageRef = ref(storage, `clothes/${compressedFile.name}_${Date.now()}`);
      await uploadBytes(storageRef, compressedFile);

      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "clothes"), {
        type,
        occasion,
        imageUrl,
        storagePath: storageRef.fullPath,
        wearCount: 0
      });

      setFile(null);
      setType("");
      setOccasion("");
      fetchClothes();
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Failed to add item");
    }
  };

  const markAsWorn = async (id, currentCount) => {
    try {
      const docRef = doc(db, "clothes", id);
      await updateDoc(docRef, { wearCount: currentCount + 1 });
      fetchClothes();
    } catch (err) {
      console.error("Error marking as worn:", err);
    }
  };

  const pickRandom = () => {
    if (clothes.length === 0) return;
    const random = clothes[Math.floor(Math.random() * clothes.length)];
    alert(`Today's pick: ${random.type} (${random.occasion})`);
    markAsWorn(random.id, random.wearCount);
  };

  const pickLeastWorn = () => {
    if (clothes.length === 0) return;
    const sorted = [...clothes].sort((a, b) => a.wearCount - b.wearCount);
    setLeastWornList(sorted);
    setMostPopularList([]); // Clear the other list
  };

  const pickMostPopular = () => {
    if (clothes.length === 0) return;
    const sorted = [...clothes].sort((a, b) => b.wearCount - a.wearCount);
    setMostPopularList(sorted);
    setLeastWornList([]); // Clear the other list
  };

  const applyFilter = () => {
    setLeastWornList([]);
    setMostPopularList([]);
    fetchClothes();
  };

  // Optimistic delete
  const deleteItem = async (id, storagePath) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    setClothes(prev => prev.filter(item => item.id !== id)); // remove from UI immediately

    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, "clothes", id));
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item. Refresh to see correct list.");
      fetchClothes();
    }
  };

  // Decide which list/grid to display
  const displayGrid = leastWornList.length === 0 && mostPopularList.length === 0;
  const displayList = leastWornList.length > 0 ? leastWornList : mostPopularList;

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h1>Clothing Picker</h1>

      {/* Add Clothing Form */}
      <div style={{ marginBottom: 20 }}>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />

        <select value={type || ""} onChange={e => setType(e.target.value)}>
          <option value="">Select Type</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={occasion || ""} onChange={e => setOccasion(e.target.value)}>
          <option value="">Select Occasion</option>
          {occasions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        <button onClick={handleAdd}>Add Item</button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20 }}>
        <select value={filterType || ""} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={filterOccasion || ""} onChange={e => setFilterOccasion(e.target.value)}>
          <option value="">All Occasions</option>
          {occasions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        <button onClick={applyFilter}>Apply Filter / Reset</button>
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={pickRandom}>Pick Random</button>
        <button onClick={pickLeastWorn}>Show Least Worn</button>
        <button onClick={pickMostPopular}>Show Most Popular</button>
      </div>

      {/* Display sorted list if exists */}
      {displayList.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2>{leastWornList.length > 0 ? "Least Worn → Most Worn" : "Most Worn → Least Worn"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {displayList.map(item => (
              <div
  key={item.id}
  style={{
    border: "1px solid #ccc",
    padding: 5,
    aspectRatio: "3 / 4",   // <-- ensures 3:4 ratio
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  }}
>
  <img
    src={item.imageUrl}
    alt="clothing"
    style={{ width: "100%", height: "auto", flexGrow: 1, objectFit: "cover" }}
  />
  <div>Type: {item.type}</div>
  <div>Occasion: {item.occasion}</div>
  <div>Worn: {item.wearCount} times</div>
  <button onClick={() => markAsWorn(item.id, item.wearCount)}>Mark as Worn</button>
  <button onClick={() => deleteItem(item.id, item.storagePath)}>Delete Item</button>
</div>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      {displayGrid && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {clothes.map(item => (
            <div key={item.id} style={{ border: "1px solid #ccc", padding: 5 }}>
              <img src={item.imageUrl} alt="clothing" style={{ width: "100%", height: 80, objectFit: "cover" }} />
              <div style={{ fontSize: 12 }}>Type: {item.type}</div>
              <div style={{ fontSize: 12 }}>Occasion: {item.occasion}</div>
              <div style={{ fontSize: 12 }}>Worn: {item.wearCount}</div>
              <button style={{ fontSize: 10 }} onClick={() => markAsWorn(item.id, item.wearCount)}>Mark as Worn</button>
              <button style={{ fontSize: 10 }} onClick={() => deleteItem(item.id, item.storagePath)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
