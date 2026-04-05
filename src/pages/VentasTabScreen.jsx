import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    ActivityIndicator,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native'
import {
    getCatalogErrorMessage,
    isRemoteImage,
    listSellerProducts,
    mapCatalogProductToVentasItem,
} from '../services/catalog'

const FILTROS = ['activa', 'inactiva']

export default function VentasTab({ sellerId, refreshKey, onOpenPublish }) {
    const [busqueda, setBusqueda] = useState('')
    const [filtrosActivos, setFiltrosActivos] = useState(['activa', 'inactiva'])
    const [publicaciones, setPublicaciones] = useState([])
    const [loadingPublicaciones, setLoadingPublicaciones] = useState(true)
    const [publicacionesError, setPublicacionesError] = useState('')

    const loadPublicaciones = useCallback(async () => {
        if (!sellerId) {
            setPublicaciones([])
            setLoadingPublicaciones(false)
            return
        }

        setLoadingPublicaciones(true)
        setPublicacionesError('')

        try {
            const products = await listSellerProducts({
                sellerId,
                onlyAvailable: false,
            })

            setPublicaciones(products.map(mapCatalogProductToVentasItem))
        } catch (error) {
            setPublicacionesError(
                getCatalogErrorMessage(error, 'No pudimos cargar tus publicaciones.')
            )
        } finally {
            setLoadingPublicaciones(false)
        }
    }, [sellerId])

    useEffect(() => {
        loadPublicaciones()
    }, [loadPublicaciones, refreshKey])

    function toggleFiltro(filtro) {
        setFiltrosActivos(prev =>
            prev.includes(filtro)
                ? prev.filter(f => f !== filtro)
                : [...prev, filtro]
        )
    }

    const publicacionesFiltradas = useMemo(() => {
        return publicaciones.filter(p => {
            const coincideBusqueda = p.titulo.toLowerCase().includes(busqueda.toLowerCase())
            const coincideFiltro = filtrosActivos.includes(p.estado)
            return coincideBusqueda && coincideFiltro
        })
    }, [busqueda, filtrosActivos, publicaciones])

    function handleCrearPublicacion() {
        onOpenPublish?.()
    }

    return (
        <View style={styles.container}>

            {/* ── Encabezado ── */}
            <View style={styles.header}>
                <Text style={styles.titulo}>Gestión de publicaciones</Text>
                <TouchableOpacity style={styles.btnPublicar} onPress={handleCrearPublicacion}>
                    <Text style={styles.btnPublicarText}>+ Publicar</Text>
                </TouchableOpacity>
            </View>

            {/* ── Barra de búsqueda + filtros ── */}
            <View style={styles.toolbar}>
                <View style={styles.searchWrapper}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por título de publicación..."
                        value={busqueda}
                        onChangeText={setBusqueda}
                        placeholderTextColor="#aaa"
                    />
                    {busqueda.length > 0 && (
                        <TouchableOpacity onPress={() => setBusqueda('')}>
                            <Text style={styles.clearSearch}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.filtrosRow}>
                    {FILTROS.map(filtro => {
                        const activo = filtrosActivos.includes(filtro)
                        return (
                            <TouchableOpacity
                                key={filtro}
                                style={[styles.chip, activo && styles.chipActivo]}
                                onPress={() => toggleFiltro(filtro)}
                            >
                                <Text style={[styles.chipText, activo && styles.chipTextoActivo]}>
                                    {filtro.charAt(0).toUpperCase() + filtro.slice(1)}
                                    {activo ? '  ✕' : ''}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                    <Text style={styles.conteo}>
                        {publicacionesFiltradas.length} publicación{publicacionesFiltradas.length !== 1 ? 'es' : ''}
                    </Text>
                </View>
            </View>

            {publicacionesError ? (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{publicacionesError}</Text>
                    <TouchableOpacity onPress={loadPublicaciones}>
                        <Text style={styles.errorBannerAction}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* ── Lista o estado vacío ── */}
            {loadingPublicaciones ? (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color="#3483FA" />
                    <Text style={styles.emptyTitulo}>Cargando tus publicaciones...</Text>
                    <Text style={styles.emptySubtitulo}>
                        Estamos trayendo la informacion del catalogo real.
                    </Text>
                </View>
            ) : publicacionesFiltradas.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={styles.emptyTitulo}>
                        {busqueda.length > 0
                            ? 'No encontramos publicaciones con ese nombre.'
                            : 'Todavía no tenés publicaciones.'}
                    </Text>
                    <Text style={styles.emptySubtitulo}>
                        {busqueda.length > 0
                            ? 'Probá con otro término de búsqueda.'
                            : 'Podés crear una y empezar a vender cuando quieras.'}
                    </Text>
                    {busqueda.length === 0 && (
                        <TouchableOpacity style={styles.btnCrearEmpty} onPress={handleCrearPublicacion}>
                            <Text style={styles.btnCrearEmptyText}>Publicar ahora</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <View style={styles.lista}>
                    {/* Cabecera de columnas */}
                    <View style={styles.filaHeader}>
                        <Text style={[styles.colHeader, { flex: 4 }]}>Publicación</Text>
                        <Text style={[styles.colHeader, { flex: 2, textAlign: 'right' }]}>Precio</Text>
                        <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Stock</Text>
                        <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Vendidos</Text>
                        <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Estado</Text>
                    </View>

                    {publicacionesFiltradas.map((pub, idx) => (
                        <View
                            key={pub.id}
                            style={[styles.fila, idx % 2 === 0 && styles.filaAlterna]}
                        >
                            <View style={[styles.colTitulo, { flex: 4 }]}>
                                {isRemoteImage(pub.imagen) ? (
                                    <Image source={{ uri: pub.imagen }} style={styles.pubImage} />
                                ) : (
                                    <Text style={styles.pubEmoji}>{pub.imagen}</Text>
                                )}
                                <Text style={styles.pubTitulo} numberOfLines={2}>{pub.titulo}</Text>
                            </View>

                            <Text style={[styles.colText, { flex: 2, textAlign: 'right', fontWeight: '600' }]}>
                                ${pub.precio.toLocaleString('es-AR')}
                            </Text>

                            <Text style={[styles.colText, { flex: 1, textAlign: 'center' }]}>
                                {pub.stock}
                            </Text>

                            <Text style={[styles.colText, { flex: 1, textAlign: 'center' }]}>
                                {pub.vendidos}
                            </Text>

                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <View style={[
                                    styles.estadoBadge,
                                    pub.estado === 'activa' ? styles.estadoActiva : styles.estadoInactiva
                                ]}>
                                    <Text style={[
                                        styles.estadoText,
                                        pub.estado === 'activa' ? styles.estadoTextActiva : styles.estadoTextInactiva
                                    ]}>
                                        {pub.estado.charAt(0).toUpperCase() + pub.estado.slice(1)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* ── Aviso placeholder ── */}
            <View style={styles.aviso}>
                <Text style={styles.avisoText}>
                    Las publicaciones se cargan desde el catalogo real. La edicion y la baja quedaran para una proxima etapa.
                </Text>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    titulo: {
        fontSize: 22,
        fontWeight: '700',
        color: '#222',
    },
    btnPublicar: {
        backgroundColor: '#3483FA',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    btnPublicarText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    toolbar: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
        gap: 12,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    searchIcon: { fontSize: 14, color: '#aaa' },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        outlineStyle: 'none',
    },
    clearSearch: { fontSize: 14, color: '#aaa', paddingHorizontal: 4 },
    filtrosRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    chip: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 14,
    },
    chipActivo: {
        borderColor: '#3483FA',
        backgroundColor: '#e8f0fe',
    },
    chipText: { fontSize: 13, color: '#555' },
    chipTextoActivo: { color: '#3483FA', fontWeight: '600' },
    conteo: {
        marginLeft: 'auto',
        fontSize: 13,
        color: '#888',
    },
    lista: {
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
        marginBottom: 16,
    },
    filaHeader: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fafafa',
    },
    colHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    fila: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filaAlterna: {
        backgroundColor: '#fafafa',
    },
    errorBanner: {
        backgroundColor: '#fff7ed',
        borderLeftWidth: 3,
        borderLeftColor: '#f97316',
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
    },
    errorBannerText: {
        flex: 1,
        fontSize: 13,
        color: '#9a3412',
    },
    errorBannerAction: {
        color: '#ea580c',
        fontWeight: '700',
    },
    colTitulo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    pubEmoji: { fontSize: 24 },
    pubImage: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#e5e7eb',
    },
    pubTitulo: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        flexShrink: 1,
    },
    colText: {
        fontSize: 14,
        color: '#444',
    },
    estadoBadge: {
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    estadoActiva: { backgroundColor: '#dcfce7' },
    estadoInactiva: { backgroundColor: '#f3f4f6' },
    estadoText: { fontSize: 12, fontWeight: '600' },
    estadoTextActiva: { color: '#15803d' },
    estadoTextInactiva: { color: '#6b7280' },
    emptyState: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 60,
        paddingHorizontal: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
        marginBottom: 16,
    },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyTitulo: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8, textAlign: 'center' },
    emptySubtitulo: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
    btnCrearEmpty: {
        borderWidth: 1,
        borderColor: '#3483FA',
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 28,
    },
    btnCrearEmptyText: { color: '#3483FA', fontWeight: '600', fontSize: 14 },
    aviso: {
        backgroundColor: '#fffbeb',
        borderLeftWidth: 3,
        borderLeftColor: '#f59e0b',
        borderRadius: 6,
        padding: 12,
        marginBottom: 16,
    },
    avisoText: { fontSize: 13, color: '#92400e' },
})
