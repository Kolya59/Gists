package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"github.com/rs/zerolog/log"
)

const (
	host         = "127.0.0.1"
	port         = "4201"
	gitHubURL    = "https://api.github.com"
	clientID     = "7a3f63ef8ef5de99a305"
	clientSecret = "f802c7c697be1ccfbabda2eafe7e37f1719334b9"
	redirectURL  = "http://127.0.0.1:4200"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		code := r.RequestURI[2:]
		q := "https://github.com/login/oauth/access_token" +
			fmt.Sprintf("?client_id=%s", clientID) +
			fmt.Sprintf("&client_secret=%s", clientSecret) +
			fmt.Sprintf("&%s", code) +
			fmt.Sprintf("&redirect_uri=%s", url.QueryEscape(redirectURL))
		req, err := http.Post(
			q,
			"text/plain",
			nil,
		)
		if err != nil {
			log.Error().Err(err).Msg("Failed to prepare get token request")
			w.WriteHeader(http.StatusInternalServerError)
		}

		switch req.StatusCode {
		case 200:
			resp, err := ioutil.ReadAll(req.Body)
			if err != nil {
				// TODO Handle error
				log.Error().Err(err).Msgf("Failed to get token from github: %v", req.Status)
			}
			token := strings.Split(strings.Split(string(resp), "&")[0], "=")[1]
			http.SetCookie(w, &http.Cookie{Name: "token", Value: token})
			http.Redirect(w, r, redirectURL, http.StatusMovedPermanently)
		case 422:
			w.WriteHeader(http.StatusUnprocessableEntity)
		default:
			w.WriteHeader(http.StatusInternalServerError)
		}
	})

	http.ListenAndServe(fmt.Sprintf("%s:%s", host, port), nil)
}
