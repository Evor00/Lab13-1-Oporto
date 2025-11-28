import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // --- ESTADOS ---
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  
  // Estado Formulario Producto
  const [productForm, setProductForm] = useState({
    name: '', warehouse: '', price: '', quantity: '', categoryIds: [] 
  })

  // Estado Formulario Categoría
  const [categoryName, setCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api"

  // --- CARGA INICIAL ---
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`)
      setProducts(await res.json())
    } catch (e) { console.error(e) }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`)
      setCategories(await res.json())
    } catch (e) { console.error(e) }
  }

  // --- LÓGICA PRODUCTOS ---
  const handleProductChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value })
  }

  const handleCategorySelect = (e) => {
    const value = parseInt(e.target.value)
    const isChecked = e.target.checked
    if (isChecked) {
      setProductForm(prev => ({ ...prev, categoryIds: [...prev.categoryIds, value] }))
    } else {
      setProductForm(prev => ({ ...prev, categoryIds: prev.categoryIds.filter(id => id !== value) }))
    }
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name: productForm.name,
      warehouse: productForm.warehouse,
      price: parseFloat(productForm.price),
      quantity: parseInt(productForm.quantity),
      categories: productForm.categoryIds.map(id => ({ id: id })) 
    }

    await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    alert("✅ Producto guardado")
    fetchProducts()
    setProductForm({ name: '', warehouse: '', price: '', quantity: '', categoryIds: [] }) 
  }

  const deleteProduct = async (id) => {
    if(!confirm("¿Borrar producto?")) return;
    await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  // --- LÓGICA CATEGORÍAS ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    
    if (editingCategory) {
      // EDITAR
      await fetch(`${API_URL}/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName })
      })
      alert("✅ Categoría actualizada")
      setEditingCategory(null)
    } else {
      // CREAR
      await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName })
      })
      alert("✅ Categoría creada")
    }
    
    setCategoryName('')
    fetchCategories()
  }

  const startEditCategory = (cat) => {
    setCategoryName(cat.name)
    setEditingCategory(cat)
  }

  const deleteCategory = async (id) => {
    if(!confirm("¿Borrar categoría? Si tiene productos asociados podría fallar.")) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' })
      if(res.ok) {
        fetchCategories()
        fetchProducts()
      } else {
        alert("❌ Error al eliminar. Puede que esté asignada a un producto.")
      }
    } catch (e) { console.error(e) }
  }

  const cancelEdit = () => {
    setCategoryName('')
    setEditingCategory(null)
  }

  // --- UTILIDADES ---
  const formatCurrency = (amount) => 
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)

  return (
    <div className="container">
      <h1 className="header-title">✨ Gestión de Inventario & Categorías</h1>

      <div className="dashboard-grid">
        
        {/* COLUMNA IZQUIERDA: FORMULARIOS */}
        <div style={{display:'flex', flexDirection:'column', gap:'2rem'}}>
          
          {/* CARD 1: GESTIÓN DE CATEGORÍAS */}
          <div className="card" style={{borderLeft: '4px solid #c084fc'}}>
            <h3 className="form-title">
              {editingCategory ? '✏️ Editar Categoría' : '🏷️ Nueva Categoría'}
            </h3>
            <form onSubmit={handleCategorySubmit} style={{display:'flex', gap:'10px'}}>
              <input 
                className="form-input" 
                placeholder="Nombre Categoría" 
                value={categoryName} 
                onChange={e => setCategoryName(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" style={{marginTop:0, width:'auto'}}>
                {editingCategory ? 'Actualizar' : 'Crear'}
              </button>
              {editingCategory && (
                <button type="button" onClick={cancelEdit} className="btn-delete" style={{background:'#475569', color:'white', border:'none'}}>
                  X
                </button>
              )}
            </form>

            <div style={{marginTop:'15px', display:'flex', flexWrap:'wrap', gap:'8px'}}>
              {categories.map(cat => (
                <div key={cat.id} className="category-chip" style={{cursor:'default', display:'flex', alignItems:'center', gap:'8px', background: '#334155'}}>
                  {cat.name}
                  <div style={{display:'flex', gap:'4px'}}>
                    <span 
                      onClick={() => startEditCategory(cat)} 
                      style={{cursor:'pointer', fontSize:'12px'}}>✏️</span>
                    <span 
                      onClick={() => deleteCategory(cat.id)} 
                      style={{cursor:'pointer', fontSize:'12px', color:'#ff4444'}}>🗑️</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 2: GESTIÓN DE PRODUCTOS */}
          <div className="card form-card">
            <h3 className="form-title">📦 Nuevo Producto</h3>
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <input className="form-input" name="name" placeholder="Nombre del Producto" onChange={handleProductChange} value={productForm.name} required />
              </div>
              <div className="form-group">
                <input className="form-input" name="warehouse" placeholder="Almacén" onChange={handleProductChange} value={productForm.warehouse} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <input className="form-input" name="price" type="number" step="0.01" placeholder="Precio (S/)" onChange={handleProductChange} value={productForm.price} required />
                </div>
                <div className="form-group">
                  <input className="form-input" name="quantity" type="number" placeholder="Cantidad" onChange={handleProductChange} value={productForm.quantity} required />
                </div>
              </div>

              <div className="form-group">
                <label className="categories-label">Asignar Categorías:</label>
                <div className="categories-grid">
                  {categories.map(cat => (
                    <label key={cat.id} style={{cursor:'pointer'}}>
                      <input 
                        type="checkbox" 
                        className="category-checkbox"
                        value={cat.id} 
                        onChange={handleCategorySelect}
                        checked={productForm.categoryIds.includes(cat.id)}
                      />
                      <span className="category-chip">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary">Guardar Producto</button>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: TABLA DE PRODUCTOS (SIN ID) */}
        <div className="card table-card">
          <h3 className="form-title">Listado de Inventario</h3>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Categorías</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No hay datos</td></tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id}>
                      <td style={{fontWeight: '500', color: 'white'}}>{p.name}</td>
                      <td>{formatCurrency(p.price)}</td>
                      <td>{p.quantity}</td>
                      <td>
                        {p.categories && p.categories.map(c => (
                          <span key={c.id} className="tag-badge">{c.name}</span>
                        ))}
                      </td>
                      <td>
                        <button className="btn-delete" onClick={() => deleteProduct(p.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App