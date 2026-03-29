import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, TextField, Grid, Drawer, Fade } from '@mui/material';
import { Add, Inventory2 } from '@mui/icons-material';
import { getItems, createItem, deleteItem, deleteItemAttribute, createItemAttribute } from '../api';
import DefinitionCard from '../components/definitions/DefinitionCard';
import DefinitionDrawer from '../components/definitions/DefinitionDrawer';

export default function Items() {
    const { tenantUri } = useParams();
    const [items, setItems] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [newItemName, setNewItemName] = useState('');

    const loadItems = useCallback(async () => {
        if (!tenantUri) return;
        try {
            const res = await getItems(tenantUri);
            setItems(res.data || []);
        } catch (err) {
            console.error("Failed to load items", err);
        }
    }, [tenantUri]);

    useEffect(() => { loadItems(); }, [loadItems]);

    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            await createItem(tenantUri, newItemName, []);
            setIsCreateOpen(false);
            setNewItemName('');
            await loadItems();
        } catch (err) {
            console.error("Failed to create item", err);
        }
    };

    return (
        <Fade in timeout={800}>
            <Box sx={{ width: '100%', pb: 10, px: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                    <Box>
                        <Typography variant="h3" fontWeight={900} sx={{ color: '#fff', letterSpacing: -1.5 }}>
                            Item Library
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#94a3b8', mt: 1, fontWeight: 400 }}>
                            Define different items for {tenantUri}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setIsCreateOpen(true)}
                        sx={{
                            borderRadius: '16px', fontWeight: 800, px: 4, py: 2,
                            background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        Create Item
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {items.map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || index}>
                            <DefinitionCard
                                index={index}
                                data={item}
                                icon={Inventory2}
                                onAddAttribute={setSelectedItem}
                                onDeleteAttribute={(attrId) => deleteItemAttribute(tenantUri, attrId).then(loadItems)}
                                onDeleteDefinition={(id) => {
                                    if(window.confirm("Delete this item blueprint?"))
                                        deleteItem(tenantUri, id).then(loadItems)
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>

                <Drawer
                    anchor="right" open={isCreateOpen} onClose={() => setIsCreateOpen(false)}
                    PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, bgcolor: '#0f172a', p: 6, borderLeft: '1px solid rgba(255,255,255,0.08)' } }}
                >
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', mb: 6 }}>New Item Blueprint</Typography>
                    <form onSubmit={handleCreateItem}>
                        <TextField fullWidth label="Item Name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required sx={{ mb: 4 }} />
                        <Button fullWidth variant="contained" type="submit" size="large" sx={{ py: 2.5, borderRadius: '16px', fontWeight: 800 }}>
                            Create Blueprint
                        </Button>
                    </form>
                </Drawer>

                <DefinitionDrawer
                    open={Boolean(selectedItem)}
                    title={selectedItem?.name}
                    subtitle="Add Item Attribute"
                    onClose={() => setSelectedItem(null)}
                    onRefresh={loadItems}
                    onSave={(payload) => createItemAttribute(tenantUri, selectedItem.id, payload)}
                />
            </Box>
        </Fade>
    );
}