import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image } from 'react-native';





export default function App() {


  const [city, setCity] = useState('');
  const [temperature, setTemperature] = useState(0);
  const [isRaining, setIsRaining] = useState(false);
  const [lastPokemonType, setLastPokemonType] = useState('');
  const [pokemon, setPokemon] = useState({});
  const [cityNotFound, setCityNotFound] = useState(false);
  const [pokemonHasImage, setPokemonHasImage] = useState(true);



  // Função para buscar o clima atual da cidade a partir da API do OpenWeatherMap
  const fetchWeather = async () => {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=0c0737814e07c17a523796df83d08f6d&units=metric`);
      setTemperature(response.data.main.temp);
      setIsRaining(response.data.weather[0].main === 'Rain');
    } catch (erro) {
      setTemperature(0);
      setIsRaining(false);
      setCityNotFound(true);
    }
  };





  // Função para buscar um Pokémon aleatório a partir da API da PokeAPI
  const fetchPokemon = async () => {
    const types = ['fire', 'water', 'electric', 'grass', 'ice', 'ground', 'bug', 'rock', 'normal'];
    let type;
    // Se estiver chovendo, o tipo será elétrico
    if (isRaining) {
      type = 'electric';
    } else {
      // Se não estiver chovendo, define o tipo a partir da temperatura atual
      const temperatureRanges = [
        { min: -Infinity, max: 5, type: 'ice' },
        { min: 5, max: 10, type: 'water' },
        { min: 12, max: 15, type: 'grass' },
        { min: 15, max: 21, type: 'ground' },
        { min: 23, max: 27, type: 'bug' },
        { min: 27, max: 33, type: 'rock' },
        { min: 33, max: Infinity, type: 'fire' },
      ];
      // Encontra o intervalo de temperatura correspondente e define o tipo a partir dele
      const range = temperatureRanges.find((range) => range.min <= temperature && temperature < range.max);
      type = range ? range.type : 'normal';
    }
    // Se o tipo for igual ao último tipo de Pokémon gerado, escolhe um Pokémon normal
    if (type === lastPokemonType) {
      type = 'normal';
    }
    // Busca os Pokémon do tipo escolhido na API da PokeAPI
    setLastPokemonType(type);
    const response = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
    const pokemons = response.data.pokemon;
    //gera um índice aleatório entre 0 e o número de Pokémons encontrados (menos 1) da lista.
    const randomIndex = Math.floor(Math.random() * pokemons.length);
    const pokemonName = pokemons[randomIndex].pokemon.name;
    const pokemonImageUrl = `https://img.pokemondb.net/artwork/${pokemonName}.jpg`;
    setPokemon({ name: pokemonName, imageUrl: pokemonImageUrl });
  };




  // atualiza o estado pokemonHasImage para false caso ocorra algum erro ao carregar a imagem do Pokémon.
  const handlePokemonImageError = () => {
    setPokemonHasImage(false);
  };



  // atualiza o estado city com o valor digitado no input.
  const handleCityChange = (text) => {
    setCity(text);
    setCityNotFound(false);
  };


  //Busca a temperatura da cidade selecionada
  const handleFormSubmit = () => {
    fetchWeather();
    setPokemonHasImage(true);
  }


  //executa a função fetchPokemon() apenas quando a temperatura muda.
  useEffect(() => {
    if (temperature !== 0) {
      fetchPokemon();
    }
  }, [temperature]);


  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.pokemonBox}>
        {cityNotFound ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Cidade não encontrada.</Text>
          </View>
        ) :
          temperature !== 0 ? (
            <View >
              <Text >Temperatura atual: {city}: {temperature} °C</Text>
              <Text >{isRaining ? 'Está chovendo' : 'Não está chovendo'}</Text>
              {pokemon.name && (
                <View >
                  <Text style={styles.pokemonName}>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</Text>

                  {pokemonHasImage ?
                    <Image style={styles.imgPokemon} source={{ uri: pokemon.imageUrl }} alt={pokemon.name} onError={handlePokemonImageError} />
                    :
                    <View style={styles.noImgBox}>
                      <Text style={styles.errorText}>Pokémon sem imagem.</Text>
                    </View>
                  }
                </View>
              )}
            </View>
          ) :
            (
              <View>
                <Image style={styles.pokeBall} source={require('./assets/pokeball.png')} alt="Imagem Pokémon?" />
              </View>
            )
        }
      </View>


      <View style={styles.formBox}>
        <TextInput
          style={styles.textInput}
          placeholder='Digite o nome da cidade...'
          onChangeText={handleCityChange}
          value={city}
        />
        <TouchableOpacity
          onPress={() => {
            fetchPokemon();
            handleFormSubmit();
          }}
          style={styles.button}>
          <Text style={styles.textButton}>Buscar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


//Estilo da screen todos abaixo.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pokemonBox: {
    marginBottom: 20,
  },
  imgPokemon:{
    width: 200,
    height: undefined,
    aspectRatio: 1, 
  },
  pokemonName:{
    color:"#2B73B9",
    fontSize: 20,
    textAlign:"center",
    marginTop:15,
    marginBottom:10
  },
  noImgBox:{
    backgroundColor:"#4D4F52",
    justifyContent:"center",
    alignItems:"center",
    width: 200,
    height: 35, //
    marginTop:15,
    marginBottom:15
  },
    pokeBall:{
    width: 200,
    height: 200
  },
  formBox:{
      alignItems:"center",
  },
  button: {
    justifyContent:"center",
    alignItems:"center",
    backgroundColor: '#2B74BA',
    width: 80,
    height: 35,
    marginTop: 20,
  },
  textButton: {
    color: "#ffffff",
  },
  errorBox:{
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#FF322B",
    width: 200,
    height: 35,
    marginBottom:15
  },
  errorText:{
    color:"#ffffff"
  }
});