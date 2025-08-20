import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Thermometer,
  Newspaper,
  MapPin,
  Info,
  Check,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { setTemperatureUnit, setNewsCategories } from '../store/slices/settingsSlice';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CategoryOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const AVAILABLE_CATEGORIES: CategoryOption[] = [
  { id: 'general', name: 'General', description: 'Top headlines and breaking news', icon: '📰' },
  { id: 'business', name: 'Business', description: 'Market trends and corporate news', icon: '💼' },
  { id: 'entertainment', name: 'Entertainment', description: 'Movies, TV shows, and celebrity news', icon: '🎬' },
  { id: 'health', name: 'Health', description: 'Medical news and health tips', icon: '🏥' },
  { id: 'science', name: 'Science', description: 'Scientific discoveries and research', icon: '🔬' },
  { id: 'sports', name: 'Sports', description: 'Sports scores and athletic news', icon: '⚽' },
  { id: 'technology', name: 'Technology', description: 'Tech innovations and gadgets', icon: '💻' },
];

const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { temperatureUnit, newsCategories, location } = useAppSelector(state => state.settings);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(newsCategories);

  const handleTemperatureUnitChange = (unit: 'celsius' | 'fahrenheit') => {
    dispatch(setTemperatureUnit(unit));
  };

  const handleCategoryToggle = (categoryId: string) => {
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    if (updatedCategories.length === 0) {
      Alert.alert(
        'Selection Required',
        'Please select at least one news category to continue receiving personalized news.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedCategories(updatedCategories);
    dispatch(setNewsCategories(updatedCategories));
  };

  const renderTemperatureSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Thermometer size={24} color="#4A90E2" strokeWidth={2} />
        <Text style={styles.sectionTitle}>Temperature Unit</Text>
      </View>
      <Text style={styles.sectionDescription}>
        Choose how temperature is displayed throughout the app
      </Text>
      
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={[
            styles.temperatureOption,
            temperatureUnit === 'celsius' && styles.selectedOption,
          ]}
          onPress={() => handleTemperatureUnitChange('celsius')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={temperatureUnit === 'celsius' ? ['#4A90E2', '#357ABD'] : ['#F8F9FA', '#F8F9FA']}
            style={styles.temperatureGradient}
          >
            <View style={styles.temperatureContent}>
              <Text style={[
                styles.temperatureText,
                temperatureUnit === 'celsius' && styles.selectedText,
              ]}>
                Celsius (°C)
              </Text>
              <Text style={[
                styles.temperatureExample,
                temperatureUnit === 'celsius' && styles.selectedExampleText,
              ]}>
                20°C
              </Text>
              {temperatureUnit === 'celsius' && (
                <Check size={20} color="white" strokeWidth={2} />
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.temperatureOption,
            temperatureUnit === 'fahrenheit' && styles.selectedOption,
          ]}
          onPress={() => handleTemperatureUnitChange('fahrenheit')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={temperatureUnit === 'fahrenheit' ? ['#4A90E2', '#357ABD'] : ['#F8F9FA', '#F8F9FA']}
            style={styles.temperatureGradient}
          >
            <View style={styles.temperatureContent}>
              <Text style={[
                styles.temperatureText,
                temperatureUnit === 'fahrenheit' && styles.selectedText,
              ]}>
                Fahrenheit (°F)
              </Text>
              <Text style={[
                styles.temperatureExample,
                temperatureUnit === 'fahrenheit' && styles.selectedExampleText,
              ]}>
                68°F
              </Text>
              {temperatureUnit === 'fahrenheit' && (
                <Check size={20} color="white" strokeWidth={2} />
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNewsCategoriesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Newspaper size={24} color="#4A90E2" strokeWidth={2} />
        <Text style={styles.sectionTitle}>News Categories</Text>
      </View>
      <Text style={styles.sectionDescription}>
        Select news categories you're interested in. These will be used to filter news based on weather conditions.
      </Text>
      
      <View style={styles.categoriesContainer}>
        {AVAILABLE_CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                isSelected && styles.selectedCategoryCard,
              ]}
              onPress={() => handleCategoryToggle(category.id)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={isSelected ? ['#4A90E2', '#357ABD'] : ['#FFFFFF', '#F8F9FA']}
                style={styles.categoryGradient}
              >
                <View style={styles.categoryContent}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryName,
                      isSelected && styles.selectedCategoryText,
                    ]}>
                      {category.name}
                    </Text>
                    {isSelected && (
                      <Check size={18} color="white" strokeWidth={2} />
                    )}
                  </View>
                  <Text style={[
                    styles.categoryDescription,
                    isSelected && styles.selectedCategoryDescription,
                  ]}>
                    {category.description}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View style={styles.selectedCountContainer}>
        <Info size={16} color="#7F8C8D" strokeWidth={2} />
        <Text style={styles.selectedCountText}>
          {selectedCategories.length} of {AVAILABLE_CATEGORIES.length} categories selected
        </Text>
      </View>
    </View>
  );

  const renderLocationSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MapPin size={24} color="#4A90E2" strokeWidth={2} />
        <Text style={styles.sectionTitle}>Location Information</Text>
      </View>
      <Text style={styles.sectionDescription}>
        Your current location is used to provide accurate weather information
      </Text>
      
      <View style={styles.locationCard}>
        <LinearGradient
          colors={['#F8F9FA', '#FFFFFF']}
          style={styles.locationGradient}
        >
          <View style={styles.locationContent}>
            {location ? (
              <>
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>Latitude:</Text>
                  <Text style={styles.locationValue}>{location.latitude.toFixed(4)}°</Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>Longitude:</Text>
                  <Text style={styles.locationValue}>{location.longitude.toFixed(4)}°</Text>
                </View>
                <View style={styles.locationNote}>
                  <Info size={14} color="#95A5A6" strokeWidth={2} />
                  <Text style={styles.locationNoteText}>
                    Location is automatically detected and updated
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.noLocationContainer}>
                <MapPin size={32} color="#BDC3C7" strokeWidth={1} />
                <Text style={styles.noLocationText}>Location not available</Text>
                <Text style={styles.noLocationSubtext}>
                  Please ensure location services are enabled
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  const renderAppInfoSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <SettingsIcon size={24} color="#4A90E2" strokeWidth={2} />
        <Text style={styles.sectionTitle}>How Weather-Based News Works</Text>
      </View>
      
      <View style={styles.infoCards}>
        <View style={styles.infoCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.infoGradient}
          >
            <View style={styles.infoContent}>
              <Text style={styles.infoIcon}>🥶</Text>
              <Text style={styles.infoTitle}>Cold Weather (&lt;10°C)</Text>
              <Text style={styles.infoDescription}>
                Shows news with serious or somber topics to match the cold atmosphere
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.infoCard}>
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.infoGradient}
          >
            <View style={styles.infoContent}>
              <Text style={styles.infoIcon}>🔥</Text>
              <Text style={styles.infoTitle}>Hot Weather (&gt;30°C)</Text>
              <Text style={styles.infoDescription}>
                Displays alert-worthy news and urgent stories that demand attention
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.infoCard}>
          <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            style={styles.infoGradient}
          >
            <View style={styles.infoContent}>
              <Text style={styles.infoIcon}>😊</Text>
              <Text style={styles.infoTitle}>Cool Weather (10-25°C)</Text>
              <Text style={styles.infoDescription}>
                Features positive news, achievements, and uplifting stories
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTemperatureSection()}
        {renderNewsCategoriesSection()}
        {renderLocationSection()}
        {renderAppInfoSection()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 22,
    marginBottom: 20,
    marginLeft: 36,
  },

  // Temperature Section
  optionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  temperatureOption: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedOption: {
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  temperatureGradient: {
    padding: 20,
    minHeight: 100,
  },
  temperatureContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  temperatureText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  selectedText: {
    color: 'white',
  },
  temperatureExample: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  selectedExampleText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // News Categories Section
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCategoryCard: {
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  categoryGradient: {
    padding: 16,
    minHeight: 120,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    flex: 1,
  },
  selectedCategoryText: {
    color: 'white',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
  selectedCategoryDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  selectedCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
  },
  selectedCountText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 8,
    fontWeight: '500',
  },

  // Location Section
  locationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationGradient: {
    padding: 20,
  },
  locationContent: {
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  locationValue: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '700',
  },
  locationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  locationNoteText: {
    fontSize: 13,
    color: '#95A5A6',
    marginLeft: 8,
    textAlign: 'center',
    flex: 1,
  },
  noLocationContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noLocationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 12,
    marginBottom: 4,
  },
  noLocationSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
  },

  // App Info Section
  infoCards: {
    gap: 16,
  },
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  infoGradient: {
    padding: 20,
  },
  infoContent: {
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SettingsScreen;