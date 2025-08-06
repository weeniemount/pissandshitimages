// Statistics utilities
const supabase = require('../config/database');

// Get image statistics
async function getImageStats() {
    try {
        // Get total count
        const { count: totalCount, error: countError } = await supabase
            .from('images')
            .select('*', { count: 'exact', head: true });
        
        if (countError) throw countError;
        
        // Get visible count (not hidden)
        const { count: visibleCount, error: visibleError } = await supabase
            .from('images')
            .select('*', { count: 'exact', head: true })
            .not('mimetype', 'ilike', '%hidden%');
        
        if (visibleError) throw visibleError;
        
        // Calculate hidden count
        const hiddenCount = totalCount - visibleCount;
        
        // Get roll stats
        const { data: rollData, error: rollError } = await supabase
            .from('images')
            .select('gamblingResult, rollPercentage')
            .not('mimetype', 'ilike', '%hidden%');
        
        if (rollError) throw rollError;
        
        // Count by gambling result
        const rollStats = {
            lucky: 0,
            normal: 0,
            extreme: 0
        };
        
        // Calculate average roll
        let totalRoll = 0;
        let rollCount = 0;
        
        rollData.forEach(item => {
            if (item.gamblingResult === 'LUCKY_SURVIVOR') {
                rollStats.lucky++;
            } else if (item.gamblingResult === 'NORMAL_SHIT') {
                rollStats.normal++;
            } else if (item.gamblingResult === 'EXTREME_NUCLEAR') {
                rollStats.extreme++;
            }
            
            if (item.rollPercentage) {
                totalRoll += parseFloat(item.rollPercentage);
                rollCount++;
            }
        });
        
        const averageRoll = rollCount > 0 ? (totalRoll / rollCount).toFixed(2) : 0;
        
        // Get storage stats
        const { data: storageData, error: storageError } = await supabase
            .from('images')
            .select('originalSize, processedSize');
        
        if (storageError) throw storageError;
        
        let totalOriginalSize = 0;
        let totalProcessedSize = 0;
        
        storageData.forEach(item => {
            if (item.originalSize) totalOriginalSize += item.originalSize;
            if (item.processedSize) totalProcessedSize += item.processedSize;
        });
        
        // Format sizes
        const formatSize = (bytes) => {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        };
        
        const savedSize = totalOriginalSize - totalProcessedSize;
        const savedPercentage = totalOriginalSize > 0 ? 
            ((savedSize / totalOriginalSize) * 100).toFixed(2) : 0;
        
        return {
            totalCount,
            visibleCount,
            hiddenCount,
            rollStats,
            averageRoll,
            storage: {
                original: formatSize(totalOriginalSize),
                processed: formatSize(totalProcessedSize),
                saved: formatSize(savedSize),
                savedPercentage
            }
        };
    } catch (error) {
        console.error('Error getting image stats:', error);
        return {
            totalCount: 0,
            visibleCount: 0,
            hiddenCount: 0,
            rollStats: { lucky: 0, normal: 0, extreme: 0 },
            averageRoll: 0,
            storage: {
                original: '0 B',
                processed: '0 B',
                saved: '0 B',
                savedPercentage: 0
            }
        };
    }
}

module.exports = {
    getImageStats
};