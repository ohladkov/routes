import constants from './constants';

const googleMaps = (($) => {
  const init = () => {
    const mapContainer = $('[data-google="map"]')[0];
    const markersArray = [];

    const centerZoomMapToMarkers = (map, bounds) => {
      map.fitBounds(bounds);
      map.panToBounds(bounds);
    };

    const calculateAndDisplayRoute = (
      directionsService,
      directionsDisplay,
      start,
      end,
    ) => {
      directionsService.route(
        {
          origin: start,
          destination: end,
          travelMode: 'DRIVING',
        },
        (response, status) => {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            throw new Error(`Directions request failed due to ${status}`);
          }
        },
      );
    };

    const getGoogleMapsData = (url) => {
      $.getJSON(url, ({ markers }) => {
        const map = new google.maps.Map(mapContainer, constants.MAP_OPTIONS);
        const bounds = new google.maps.LatLngBounds();

        markers.forEach((markerItem) => {
          const [lat, lng] = [markerItem.position[0], markerItem.position[1]];

          const marker = new google.maps.Marker({
            map,
            position: {
              lat,
              lng,
            },
            title: markerItem.name,
            animation: google.maps.Animation.DROP,
            customInfo: {
              routes: markerItem.routes,
            },
          });

          markersArray.push(marker);

          marker.addListener('click', function markerOnClick() {
            const routes = [];

            this.customInfo.routes.forEach((route) => {
              const start = new google.maps.LatLng(
                route.start[0],
                route.start[1],
              );
              const end = new google.maps.LatLng(route.end[0], route.end[1]);
              routes.push([start, end]);
            });

            routes.forEach((route) => {
              const directionsService = new google.maps.DirectionsService();
              const directionsDisplay = new google.maps.DirectionsRenderer();

              directionsDisplay.setMap(map);
              calculateAndDisplayRoute(
                directionsService,
                directionsDisplay,
                route[0],
                route[1],
              );
            });
          });

          const location = new google.maps.LatLng(lat, lng);
          bounds.extend(location);
        });

        centerZoomMapToMarkers(map, bounds);
      }).fail((_jqxhr, _textStatus, error) => {
        throw new Error(error);
      });
    };

    const initMap = () => getGoogleMapsData(constants.DATA_URL);

    window.initMap = initMap;
  };

  return {
    init,
  };
})(jQuery);

export default googleMaps;
