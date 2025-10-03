#!/bin/bash

# Images de plantes sur fond blanc - sources libres de droits
# Utilisation de Unsplash et Pexels API

declare -A PLANT_SEARCHES=(
  ["sansevieria"]="sansevieria-plant-white-background"
  ["pothos"]="pothos-plant-white-background"
  ["spathiphyllum"]="peace-lily-white-background"
  ["monstera"]="monstera-deliciosa-white-background"
  ["philodendron"]="philodendron-plant-white-background"
  ["epipremnum"]="golden-pothos-white-background"
  ["orchidee"]="phalaenopsis-orchid-white-background"
  ["bonsai"]="ficus-bonsai-white-background"
  ["anthurium"]="anthurium-plant-white-background"
  ["cactus"]="cactus-plant-white-background"
  ["zamioculcas"]="zz-plant-white-background"
  ["succulentes"]="succulent-plants-white-background"
)

echo "Tentative de téléchargement des images..."
for plant in "${!PLANT_SEARCHES[@]}"; do
  echo "Recherche: $plant"
done
