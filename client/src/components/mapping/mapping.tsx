import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import { FormEvent, useEffect, useRef, useState, useCallback } from 'react';
import { Route } from '../../models/route'
import { Loader } from 'google-maps';
import { getCurrentPosition } from '../../util/geolocation';
import { makeCarIcon, makeMarkerIcon, MapModel } from '../../models/map'
import { getRandomColor } from '../../util/colors';
import { RouteExistsError } from '../../errors/route-exists-error';
import { useSnackbar } from 'notistack';
import NavBar from '../../components/navbar'
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL as string
const googleMapsLoader = new Loader(process.env.REACT_APP_GMAPS_API_KEY)

export type NewPositionMessage = {
  routeId: string;
  position: [number, number];
  finished: boolean;
};

const Mapping = () => {
  const [routes, setRoutes] = useState<Route[]>([])
  const [routeIdSelected, setRouteIdSelected] = useState<string>('')
  const mapRef = useRef<MapModel>();
  const socketIoRef = useRef<SocketIOClient.Socket>();
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    socketIoRef.current = io.connect(API_URL)
    socketIoRef.current.on('connect', () => console.log('socket:connected'))
  }, [])

  const finishRoute = useCallback((routeId: string) => {
    const route = routes.find(route => route._id === routeId)
    if (!route) return

    mapRef.current?.deleteRoute(routeId);
    enqueueSnackbar(`${route.title} finalizou!`, {
      variant: 'success',
    })
  }, [routes, enqueueSnackbar])

  useEffect(() => {
    console.log('new-position-effect');
    
    const handleNewPosition = (data: NewPositionMessage) => {
      const [lat, lng] = data.position;
      mapRef.current?.moveCurrentMarker(data.routeId, {lat, lng});

      if (data.finished) {
        finishRoute(data.routeId)
      }
    }

    socketIoRef.current?.on('new-position', handleNewPosition)
    return () => {
      socketIoRef.current?.off('new-position', handleNewPosition)
    }
  }, [finishRoute])

  useEffect(() => {
    fetch(`${API_URL}/routes`)
      .then(response => response.json())
      .then(routes => setRoutes(routes))
  }, [])

  useEffect(() => {
    const setupGoogleMaps = async () => {
      const [, position] = await Promise.all([
        googleMapsLoader.load(),
        getCurrentPosition({ enableHighAccuracy: true })
      ])

      const divMap = document.getElementById('map') as HTMLDivElement;
      mapRef.current = new MapModel(divMap, {
        zoom: 15,
        center: position,
      })
    }

    setupGoogleMaps()
  }, [])

  const startRoute = (e: FormEvent) => {
    e.preventDefault()

    const route = routes.find(route => route._id === routeIdSelected)
    if (!route) {
      return
    }

    try {
      const color = getRandomColor()
      mapRef.current?.addRoute(routeIdSelected, {
        currentMarkerOptions: {
          position: route.startPosition,
          icon: makeCarIcon(color),
        },
        endMarkerOptions: {
          position: route.endPosition,
          icon: makeMarkerIcon(color),
        }
      })

      socketIoRef.current?.emit('new-direction', {
        routeId: routeIdSelected
      })
    } catch (error) {
      if (error instanceof RouteExistsError) {
        enqueueSnackbar(`${route.title} já adicionado. Espere finalizar`, { variant: 'error' })
        return
      }
      
      throw error;
    }
  }

  return (
    <Grid container className="map-container">
      <Grid item xs={12} sm={3}>
        <NavBar />
        <Box padding={2}>
          <form onSubmit={startRoute}>
            <Box marginBottom={1}>
              <Select
                fullWidth
                displayEmpty
                value={routeIdSelected}
                onChange={e => setRouteIdSelected(String(e.target.value))}
              >
                <MenuItem value="">
                  <em>Selecione uma corrida</em>
                </MenuItem>
                {routes.map((route) => (
                  <MenuItem key={route._id} value={route._id}>
                    {route.title}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth>Iniciar uma corrida</Button>
          </form>
        </Box>
      </Grid>
      <Grid item xs={12} sm={9} className="map-container">
        <div id="map" className="map-container"></div>
      </Grid>
    </Grid>
  );
};

export default Mapping;
